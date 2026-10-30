import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MODEL = "openai/gpt-6-astra";

type Body = { lesson: { title: string; challenge: string }; code: string; messages: { role: "user" | "assistant"; content: string }[] };

async function verifyUser(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data } = await sb.auth.getUser(token);
  return data.user;
}

export async function handleTutor(request: Request) {
  const user = await verifyUser(request);
  if (!user) return Response.json({ error: "Please sign in to use the AI tutor." }, { status: 401 });
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return Response.json({ error: "AI tutor is not configured." }, { status: 500 });

  const body = (await request.json()) as Body;
  const history = (body.messages ?? []).slice(-12).map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) })) as ModelMessage[];
  const instructions = `You are the Questbound AI Tutor, a friendly coding mentor for beginners.
Current lesson: ${body.lesson?.title}
Challenge: ${body.lesson?.challenge}
Learner's current code:
\`\`\`
${String(body.code ?? "").slice(0, 6000)}
\`\`\`
Give contextual hints and clear explanations about this lesson and their code. Prefer nudges over full solutions; only give the complete answer if they explicitly ask after trying. Keep replies short (under 150 words), use simple language and small code snippets.`;

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages: history,
    abortSignal: request.signal,
    maxRetries: 0,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return withLovableAiGatewayRunIdHeader(result.toTextStreamResponse(), runIdFetch);
}
