import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Send, RotateCcw, Check, Lightbulb } from "lucide-react";
import { Shell } from "@/components/site";
import { runPython } from "@/lib/data";
import { AiTutor } from "@/components/ai-tutor";
import { useAuth, completeLesson } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/lesson")({
  head: () => ({
    meta: [
      { title: "Lesson 4: Loops — Questbound" },
      { name: "description", content: "Learn Python for loops and complete the challenge to earn 20 XP." },
      { property: "og:title", content: "Lesson 4: Loops — Questbound" },
      { property: "og:description", content: "Repeat. Build. Go further." },
    ],
  }),
  component: Lesson,
});

const starter = `# Lesson 4: Loops\n# Print the numbers 1 through 10\n\nfor i in range(1, 11):\n    print(i)\n`;
const steps = ["Variables", "Conditionals", "Functions", "Loops", "Projects"];

function Lesson() {
  const [code, setCode] = useState(starter);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const { user, refresh } = useAuth();
  const run = () => {
    try { setOut(runPython(code)); setErr(""); return runPython(code); } catch (e) { setErr((e as Error).message); setOut(""); return null; }
  };
  const submit = () => {
    const r = run();
    const ok = r === "1\n2\n3\n4\n5\n6\n7\n8\n9\n10";
    setDone(ok);
    if (ok && user) completeLesson("python-4-loops", 20).then((n) => { if (n) toast.success("+20 XP saved!"); else toast("Already completed — progress saved."); refresh(); }).catch(() => toast.error("Couldn't save progress."));
    if (r !== null && !ok) setErr("Not quite — print 1 through 10, each on its own line.");
  };
  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/courses" className="text-muted-foreground">← Back to courses</Link>
        <div className="flex gap-6 text-sm">
          {steps.map((s, i) => (
            <span key={s} className={i <= 3 ? "text-primary" : "text-muted-foreground"}>{i < 3 && <Check className="mr-1 inline h-4 w-4" />}{i + 1}. {s}</span>
          ))}
        </div>
        <span className="rounded-full bg-secondary px-4 py-2 font-bold text-gold">+20 XP</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_360px]">
        <article className="panel p-6">
          <p className="eyebrow text-primary">Python Fundamentals</p>
          <h1 className="mt-2 text-4xl font-bold">Lesson 4: Loops</h1>
          <p className="mt-1 text-xl text-sky">Repeat. Build. Go further.</p>
          <p className="mt-4 text-muted-foreground">Loops let you repeat a block of code multiple times. They help you automate repetitive tasks and work with collections of data.</p>
          <div className="mt-4 flex gap-3 rounded-lg border border-border bg-muted p-4 text-sm"><Lightbulb className="h-5 w-5 shrink-0 text-gold" />A loop can save you from writing the same code over and over again!</div>
          <h2 className="mt-6 text-2xl font-bold">The for loop</h2>
          <p className="mt-2 text-muted-foreground">The <code className="font-mono">for</code> loop repeats a block of code for each item in a sequence.</p>
          <pre className="mt-3 rounded-lg bg-code p-4 font-mono text-sm">{`for i in range(5):\n    print("Hello, world!")`}</pre>
          <h2 className="mt-6 text-2xl font-bold">🎯 Your challenge</h2>
          <p className="mt-2">Use a <code className="font-mono">for</code> loop to print the numbers 1 through 10, each on a new line.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Use <code className="font-mono">range(1, 11)</code> to get the numbers 1 to 10</li>
            <li>You can test your code before submitting</li>
          </ul>
        </article>
        <div className="flex flex-col gap-4">
          <div className="panel p-4">
            <div className="mb-2 flex justify-between"><span className="font-mono">main.py</span><button onClick={() => setCode(starter)} className="flex items-center gap-1 text-sky"><RotateCcw className="h-4 w-4" />Reset</button></div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={10} className="w-full rounded-lg bg-code p-4 font-mono text-sm outline-none" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button onClick={run} className="flex items-center justify-center gap-2 rounded-xl border border-sky py-3 font-semibold"><Play className="h-4 w-4" />Run Code</button>
              <button onClick={submit} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground"><Send className="h-4 w-4" />Submit Solution</button>
            </div>
          </div>
          <div className="panel flex-1 p-4">
            <p className="eyebrow text-primary">Output</p>
            <pre className="mt-3 min-h-40 font-mono text-sm">{out}</pre>
            {err && <p className="font-mono text-sm text-destructive">{err}</p>}
            {done && <p className="mt-2 font-semibold text-primary">✔ Quest complete! +20 XP earned.{!user && " Sign in to save it."}</p>}
          </div>
        </div>
        <AiTutor lesson={{ title: "Python Fundamentals — Lesson 4: Loops", challenge: "Use a for loop to print the numbers 1 through 10, each on a new line." }} code={code} />
      </div>
    </Shell>
  );
}
