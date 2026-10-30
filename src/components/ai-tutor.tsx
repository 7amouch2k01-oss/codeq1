import { useRef, useState } from "react";
import { Send, Bot, Square } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Msg = { role: "user" | "assistant"; content: string };

export function AiTutor({ lesson, code }: { lesson: { title: string; challenge: string }; code: string }) {
  const { user, profile } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const ask = async (text: string) => {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput(""); setErr(""); setBusy(true);
    const ac = new AbortController(); abortRef.current = ac;
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/tutor", {
        method: "POST",
        signal: ac.signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ lesson, code, messages: next }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? (res.status === 429 ? "The tutor is busy — try again in a moment." : res.status === 402 ? "AI credits have run out." : "The tutor couldn't answer right now."));
      }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
      if (!acc) setMsgs([...next, { role: "assistant", content: "(No answer — try rephrasing your question.)" }]);
    } catch (e) {
      if ((e as Error).name !== "AbortError") { setErr((e as Error).message); setMsgs(next); }
    } finally { setBusy(false); abortRef.current = null; }
  };

  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-center gap-3"><Bot className="h-8 w-8 text-primary" /><div><h2 className="text-2xl font-bold">AI Tutor</h2><p className="text-sm text-muted-foreground">Your coding companion. Ask questions, get hints, share your code.</p></div></div>
      {!user ? (
        <p className="mt-4 text-sm">
          <Link to="/auth" className="text-primary underline">Sign in</Link> to chat with the tutor about this lesson.
        </p>
      ) : (
        <>
          <div className="mt-4 max-h-96 flex-1 space-y-3 overflow-y-auto">
            {msgs.length === 0 && <div className="rounded-xl bg-muted p-3 text-sm">👋 Hi {profile?.display_name ?? "there"}! Stuck on this lesson? I can see your code — ask me anything.</div>}
            {msgs.map((m, i) => (
              <div key={i} className={`whitespace-pre-wrap rounded-xl p-3 text-sm ${m.role === "user" ? "ml-8 bg-secondary" : "mr-8 bg-muted"}`}>
                {m.content || <span className="animate-pulse text-muted-foreground">Thinking…</span>}
              </div>
            ))}
            {err && <p className="text-sm text-destructive">{err}</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Give me a hint", "Why doesn't my code work?", "Explain this concept"].map((q) => (
              <button key={q} onClick={() => ask(q)} disabled={busy} className="rounded-full border border-border px-3 py-1 text-xs hover:border-primary disabled:opacity-50">{q}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="mt-3 flex gap-2 rounded-xl border border-border bg-code p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask for a hint..." className="flex-1 bg-transparent px-2 outline-none" />
            {busy ? (
              <button type="button" onClick={() => abortRef.current?.abort()} aria-label="Stop" className="rounded-lg bg-secondary p-2"><Square className="h-4 w-4" /></button>
            ) : (
              <button aria-label="Send" className="rounded-lg bg-primary p-2 text-primary-foreground"><Send className="h-4 w-4" /></button>
            )}
          </form>
        </>
      )}
    </div>
  );
}
