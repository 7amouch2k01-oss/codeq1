import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/exam")({
  head: () => ({
    meta: [
      { title: "Python Beginner Exam — Questbound" },
      { name: "description", content: "Test your Python knowledge. You need 80% to pass and earn your certificate." },
      { property: "og:title", content: "Python Beginner Exam — Questbound" },
      { property: "og:description", content: "Score 80% to earn your certificate." },
    ],
  }),
  component: Exam,
});

const qs = [
  { code: "nums = [1, 2, 3]\nnums.append(4)\nprint(nums[2])", opts: ["1", "4", "3", "[1, 2, 3, 4]"], a: 2 },
  { code: 'print(len("quest"))', opts: ["4", "5", "6", "Error"], a: 1 },
  { code: "x = 3\nprint(x * 2 + 1)", opts: ["7", "8", "9", "6"], a: 0 },
  { code: "print(10 // 3)", opts: ["3.33", "3", "4", "1"], a: 1 },
  { code: 'print("ab" * 2)', opts: ["ab2", "abab", "aabb", "Error"], a: 1 },
];

function Exam() {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<number[]>([]);
  const [secs, setSecs] = useState(25 * 60);
  const [done, setDone] = useState(false);
  useEffect(() => { const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);
  const { user, refresh } = useAuth();
  const q = qs[i]!;
  const finish = async () => {
    setDone(true);
    if (!user) return;
    const sc = Math.round((ans.filter((a, k) => a === qs[k]!.a).length / qs.length) * 100);
    const { error } = await supabase.from("exam_results").insert({ user_id: user.id, exam_id: "python-beginner", score: sc, passed: sc >= 80 });
    if (error) { toast.error("Couldn't save your result."); return; }
    if (sc >= 80) await supabase.rpc("award_xp", { _amount: 50 });
    toast.success("Exam result saved.");
    refresh();
  };
  const score = Math.round((ans.filter((a, k) => a === qs[k]!.a).length / qs.length) * 100);
  return (
    <Shell>
      <div className="panel mx-auto max-w-3xl p-6">
        <div className="flex justify-between gap-4">
          <div><h1 className="text-3xl font-bold">Python Beginner Exam</h1><p className="text-muted-foreground">Test your knowledge and earn XP. You need 80% to pass.</p></div>
          <div className="h-fit rounded-xl bg-code px-4 py-2 font-mono text-xl font-bold text-gold"><Clock className="mr-2 inline h-5 w-5" />{String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</div>
        </div>
        {done ? (
          <div className="mt-8 text-center">
            <p className="font-display text-6xl font-bold text-primary">{score}%</p>
            <p className="mt-2">{score >= 80 ? "You passed! Your certificate is ready." : "Not quite — you need 80% to pass."}{!user && " Sign in to save your result."}</p>
            {score >= 80 ? <Link to="/certificate" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">View certificate</Link> : <button onClick={() => { setAns([]); setI(0); setDone(false); }} className="mt-6 rounded-xl border border-border px-6 py-3">Try again</button>}
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm">Question {i + 1} of {qs.length}</p>
            <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${((i + 1) / qs.length) * 100}%` }} /></div>
            <h2 className="mt-6 text-xl font-bold">What will be the output of the following code?</h2>
            <pre className="mt-3 rounded-lg bg-code p-4 font-mono">{q.code}</pre>
            <div className="mt-4 space-y-3">
              {q.opts.map((o, k) => (
                <button key={o} onClick={() => { const n = [...ans]; n[i] = k; setAns(n); }} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left font-mono ${ans[i] === k ? "border-primary bg-secondary" : "border-border"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${ans[i] === k ? "bg-primary text-primary-foreground" : ""}`}>{"ABCD"[k]}</span>{o}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-xl border border-border px-6 py-3 disabled:opacity-40">‹ Previous</button>
              <button disabled={ans[i] === undefined} onClick={() => (i === qs.length - 1 ? finish() : setI(i + 1))} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground disabled:opacity-40">{i === qs.length - 1 ? "Finish" : "Next ›"}</button>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
