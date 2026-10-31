import { useEffect, useRef, useState } from "react";
import { Send, Bot, Square, Lightbulb } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

export function AiTutor({ lesson, code, output, error }: { lesson: { id: string; title: string; challenge: string }; code: string; output: string; error: string }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    setMsgs([]); setErr("");
    return () => abortRef.current?.abort();
  }, [user?.id, lesson.id]);

  const ask = async (text: string) => {
    if (!user || !text.trim() || busy) return;
    const next: Msg[] = [...msgs.filter((m) => m.content.trim()), { role: "user", content: text.trim() }].slice(-12);
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput(""); setErr(""); setBusy(true);
    const ac = new AbortController(); abortRef.current = ac;
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/tutor", {
        method: "POST",
        signal: ac.signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ lessonId: lesson.id, code, output, error, messages: next }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? (res.status === 429 ? "The tutor is busy — try again in a moment." : res.status === 402 ? "AI credits have run out." : "The tutor couldn't answer right now."));
      }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = ""; let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { text?: string; error?: string };
          if (event.error) throw new Error(event.error);
          acc += event.text ?? "";
          setMsgs([...next, { role: "assistant", content: acc }]);
        }
      }
      if (!acc) { setMsgs(next); setErr("The tutor returned no hints."); }
    } catch (e) {
      if ((e as Error).name !== "AbortError") { setErr((e as Error).message); setInput(text); }
      else setMsgs((current) => current.filter((m) => m.content.trim()));
    } finally { setBusy(false); abortRef.current = null; }
  };

  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-center gap-3"><Bot className="h-8 w-8 shrink-0 text-primary" /><div className="min-w-0"><h2 className="text-2xl font-bold">AI Tutor</h2><p className="text-sm text-sky">Lesson 4 · Loops</p></div></div>
      {!user ? (
        <p className="mt-4 text-sm">
          <Link to="/auth" className="text-primary underline">Sign in</Link> to chat with the tutor about this lesson.
        </p>
      ) : (
        <>
          <div className="mt-4 max-h-96 flex-1 space-y-3 overflow-y-auto">
            {msgs.length === 0 && <p className="text-sm text-muted-foreground">Where are you stuck?</p>}
            {msgs.map((m, i) => (
               <div key={i} className={`whitespace-pre-wrap break-words rounded-lg p-3 text-sm ${m.role === "user" ? "ml-4 bg-secondary" : "bg-muted"}`}>
                {m.content || (busy && i === msgs.length - 1 ? <span className="text-muted-foreground">Thinking…</span> : null)}
              </div>
            ))}
            {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Give me a hint", "Why doesn't my code work?", "Explain this concept"].map((q) => (
              <Button key={q} variant="outline" size="sm" onClick={() => ask(q)} disabled={busy}><Lightbulb />{q}</Button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="mt-4 space-y-2">
            <label htmlFor="coding-problem" className="text-sm font-semibold">Describe your coding problem</label>
            <textarea id="coding-problem" value={input} maxLength={4000} disabled={busy} onChange={(e) => setInput(e.target.value)} placeholder="I expected 1–10, but my loop stops at 9…" rows={4} className="w-full resize-y rounded-lg border border-input bg-code p-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            {busy ? (
              <Button type="button" variant="secondary" onClick={() => abortRef.current?.abort()}><Square />Stop</Button>
            ) : (
              <Button type="submit" disabled={!input.trim()} className="w-full"><Send />Get lesson hints</Button>
            )}
          </form>
        </>
      )}
    </div>
  );
}
