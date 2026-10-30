import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Swords, Clock, Play } from "lucide-react";
import { Shell } from "@/components/site";

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Daily Battle — Questbound" },
      { name: "description", content: "Today's coding challenge: reverse a string and win 50 XP." },
      { property: "og:title", content: "Daily Battle — Questbound" },
      { property: "og:description", content: "Code today. Climb tomorrow." },
    ],
  }),
  component: Battle,
});

const starter = `def reverse_string(s):\n    # Write your code here\n    pass`;

function Battle() {
  const [code, setCode] = useState(starter);
  const [left, setLeft] = useState("");
  const [result, setResult] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now); end.setUTCHours(24, 0, 0, 0);
      const s = Math.floor((+end - +now) / 1000);
      setLeft([s / 3600, (s % 3600) / 60, s % 60].map((n) => String(Math.floor(n)).padStart(2, "0")).join(":"));
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  const submit = () => {
    const ok = /return\s+s\[::-1\]/.test(code) || /return\s+["']{2}\.join\(reversed\(s\)\)/.test(code);
    setResult(ok ? "Victory! +50 XP — you beat PixelRogue." : "Tests failed: reverse_string('hello') should return 'olleh'.");
  };
  return (
    <Shell>
      <div className="panel mx-auto max-w-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><Swords className="h-10 w-10 text-gold" /><div><h1 className="text-4xl font-bold">Daily Battle</h1><p className="text-muted-foreground">Code today. Climb tomorrow.</p></div></div>
          <div className="rounded-xl bg-code px-4 py-2"><span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" />Ends in</span><span className="font-mono text-2xl font-bold text-primary">{left}</span></div>
        </div>
        <div className="my-6 flex items-center justify-center gap-10 text-center">
          <div><div className="font-bold">PixelRogue</div><div className="text-sm text-muted-foreground">Level 12</div></div>
          <span className="font-display text-4xl font-bold text-ember">VS</span>
          <div><div className="font-bold text-primary">You</div><div className="text-sm text-muted-foreground">Level 12</div></div>
        </div>
        <div className="rounded-xl border border-border p-5">
          <div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Today's Challenge</p><h2 className="text-2xl font-bold">Reverse a string</h2></div><span className="h-fit rounded-md border border-primary px-3 py-1 text-sm text-primary">Easy</span></div>
          <p className="mt-2 text-muted-foreground">Given a string s, return a new string with the characters in reverse order.</p>
          <pre className="mt-3 font-mono text-sm">{`Input:  s = "hello"\nOutput: "olleh"`}</pre>
        </div>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={6} className="mt-4 w-full rounded-xl bg-code p-4 font-mono text-sm outline-none" />
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-gold"><div className="text-sm text-muted-foreground">Reward</div><div className="text-2xl font-bold">+50 XP</div></div>
          <button onClick={submit} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground glow"><Play className="h-4 w-4" />Submit Solution</button>
        </div>
        {result && <p className={`mt-4 font-semibold ${result.startsWith("Victory") ? "text-primary" : "text-destructive"}`}>{result}</p>}
      </div>
    </Shell>
  );
}
