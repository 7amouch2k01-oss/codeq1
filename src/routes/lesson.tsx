import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Play, Send, RotateCcw, Check, Lightbulb, ChevronRight, ChevronLeft } from "lucide-react";
import { Shell } from "@/components/site";
import { executePythonCode, initPyodide } from "@/lib/pyodide-runner";
import { AiTutor } from "@/components/ai-tutor";
import { useAuth, completeLesson } from "@/hooks/use-auth";
import { toast } from "sonner";
import { lessonsRegistry } from "@/lib/lesson-context";
import { z } from "zod";

const searchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute("/lesson")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Interactive Lessons — Questbound" },
      {
        name: "description",
        content:
          "Learn Python through real in-browser execution, live challenges, and AI mentor guidance.",
      },
      { property: "og:title", content: "Interactive Lessons — Questbound" },
      { property: "og:description", content: "Repeat. Build. Go further." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LessonPage,
});

const defaultLessonId = "python-4-loops";

const lessonStarters: Record<string, string> = {
  "python-1-variables": `# Lesson 1: Variables\n# Assign 'Questbound' to hero and print it\nhero = "Questbound"\nprint(hero)\n`,
  "python-2-conditionals": `# Lesson 2: Conditionals\n# Check if xp >= 100\nxp = 120\nif xp >= 100:\n    print("Level Up!")\n`,
  "python-3-functions": `# Lesson 3: Functions\n# Define greet(name) and call it\ndef greet(name):\n    return "Welcome, " + name\n\nprint(greet("Adventurer"))\n`,
  "python-4-loops": `# Lesson 4: Loops\n# Print the numbers 1 through 10\nfor i in range(1, 11):\n    print(i)\n`,
  "python-5-projects": `# Lesson 5: Projects\n# Calculate total quest score\ndef calc_score(base, bonus):\n    return base + bonus\n\nprint("Total Score:", calc_score(150, 50))\n`,
  "python-6-lists": `# Lesson 6: Lists and Loops\n# Iterate through quest inventory\nitems = ["Sword", "Shield", "Potion"]\nfor item in items:\n    print("Found:", item)\n`,
};

const lessonExpected: Record<string, (out: string) => boolean> = {
  "python-1-variables": (o) => o.trim().includes("Questbound"),
  "python-2-conditionals": (o) => o.trim().includes("Level Up!"),
  "python-3-functions": (o) => o.trim().includes("Welcome, Adventurer"),
  "python-4-loops": (o) => o.trim() === "1\n2\n3\n4\n5\n6\n7\n8\n9\n10",
  "python-5-projects": (o) => o.trim().includes("200"),
  "python-6-lists": (o) => o.trim().includes("Sword") && o.trim().includes("Potion"),
};

const allLessonIds = Object.keys(lessonsRegistry);

function LessonPage() {
  const search = Route.useSearch();
  const currentLessonId = search.id && search.id in lessonsRegistry ? search.id : defaultLessonId;
  const lesson = lessonsRegistry[currentLessonId]!;

  const [code, setCode] = useState(lessonStarters[currentLessonId] || "");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const { user, refresh } = useAuth();

  // Reset editor and output when switching lessons
  useEffect(() => {
    setCode(lessonStarters[currentLessonId] || "");
    setOut("");
    setErr("");
    setDone(false);
    // Pre-warm pyodide in the background
    initPyodide().catch(() => {});
  }, [currentLessonId]);

  const currentIndex = allLessonIds.indexOf(currentLessonId);
  const prevLessonId = currentIndex > 0 ? allLessonIds[currentIndex - 1] : null;
  const nextLessonId =
    currentIndex < allLessonIds.length - 1 ? allLessonIds[currentIndex + 1] : null;

  const run = async () => {
    setRunning(true);
    setErr("");
    try {
      const result = await executePythonCode(code);
      setOut(result.output);
      setErr(result.error);
      return result;
    } finally {
      setRunning(false);
    }
  };

  const submit = async () => {
    const res = await run();
    const checker = lessonExpected[currentLessonId] || ((o) => o.trim().length > 0);
    const ok = !res.error && checker(res.output);
    setDone(ok);

    if (ok) {
      if (user) {
        completeLesson(currentLessonId, 20)
          .then((n) => {
            if (n) toast.success("+20 XP saved!");
            else toast("Already completed — progress saved.");
            refresh();
          })
          .catch(() => toast.error("Couldn't save progress."));
      } else {
        toast.success("Correct! Sign in to save your XP.");
      }
    } else {
      setErr("Challenge not met yet. Review the requirements or ask the AI tutor for a nudge!");
    }
  };

  return (
    <Shell>
      {/* Navigation header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/map" className="text-muted-foreground hover:text-foreground">
          ← Back to quest map
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {allLessonIds.map((lid, i) => (
            <Link
              key={lid}
              to="/lesson"
              search={{ id: lid }}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                lid === currentLessonId
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              L{i + 1}
            </Link>
          ))}
        </div>
        <span className="rounded-full bg-secondary px-4 py-2 font-bold text-gold">+20 XP</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_360px]">
        {/* Lesson guide */}
        <article className="panel flex flex-col justify-between p-6">
          <div>
            <p className="eyebrow text-primary">Python Mastery</p>
            <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
            <p className="mt-1 text-sky font-medium">{lesson.concepts}</p>
            <div className="mt-4 flex gap-3 rounded-lg border border-border bg-muted p-4 text-sm">
              <Lightbulb className="h-5 w-5 shrink-0 text-gold" />
              <span>
                Real Python execution: You can write real code, create functions, and experiment!
              </span>
            </div>
            <h2 className="mt-6 text-xl font-bold">🎯 Your Challenge</h2>
            <p className="mt-2 text-muted-foreground">{lesson.challenge}</p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            {prevLessonId ? (
              <Link
                to="/lesson"
                search={{ id: prevLessonId }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            ) : (
              <span />
            )}
            {nextLessonId && (
              <Link
                to="/lesson"
                search={{ id: nextLessonId }}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Next Lesson <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </article>

        {/* Code Editor & Output */}
        <div className="flex flex-col gap-4">
          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-sm text-muted-foreground">
                main.py (Python 3.12 WebAssembly)
              </span>
              <button
                onClick={() => setCode(lessonStarters[currentLessonId] || "")}
                className="flex items-center gap-1 text-sm text-sky hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={11}
              className="w-full resize-none rounded-lg bg-code p-4 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={run}
                disabled={running}
                className="flex items-center justify-center gap-2 rounded-xl border border-sky py-3 font-semibold transition hover:bg-sky/10 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {running ? "Running…" : "Run Code"}
              </button>
              <button
                onClick={submit}
                disabled={running}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 glow"
              >
                <Send className="h-4 w-4" />
                Submit Solution
              </button>
            </div>
          </div>

          <div className="panel flex-1 p-4">
            <p className="eyebrow text-primary">Terminal Output</p>
            <pre className="mt-3 min-h-32 whitespace-pre-wrap font-mono text-sm text-foreground">
              {out ||
                (running
                  ? "Running in Python WebAssembly environment…"
                  : "Click 'Run Code' to execute.")}
            </pre>
            {err && (
              <p className="mt-2 whitespace-pre-wrap font-mono text-sm text-destructive">{err}</p>
            )}
            {done && (
              <div className="mt-3 rounded-lg border border-primary bg-secondary/70 p-3">
                <p className="font-semibold text-primary flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Quest Complete! +20 XP earned.
                  {!user && " Sign in to save your progress."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Tutor Assistant */}
        <AiTutor lesson={lesson} code={code} output={out} error={err} />
      </div>
    </Shell>
  );
}
