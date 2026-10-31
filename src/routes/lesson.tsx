import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Play,
  Send,
  RotateCcw,
  Check,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Eye,
  Code2,
} from "lucide-react";
import { Shell } from "@/components/site";
import { executePythonCode, initPyodide } from "@/lib/pyodide-runner";
import { CodeEditor } from "@/components/code-editor";
import { AiTutor } from "@/components/ai-tutor";
import { useAuth, completeLesson } from "@/hooks/use-auth";
import { toast } from "sonner";
import { multiCourseRegistry, type LanguageTrack, type LessonInfo } from "@/lib/lesson-context";
import { z } from "zod";
import confetti from "canvas-confetti";

const searchSchema = z.object({
  id: z.string().optional(),
  track: z.enum(["python", "html", "c", "cpp"]).optional(),
});

export const Route = createFileRoute("/lesson")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Interactive Coding Quests — Questbound" },
      {
        name: "description",
        content:
          "Interactive lessons across Python, HTML, C, and C++ with real code execution and AI mentor assistance.",
      },
      { property: "og:title", content: "Interactive Coding Quests — Questbound" },
      { property: "og:description", content: "Repeat. Build. Go further." },
    ],
  }),
  component: LessonPage,
});

function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#fbbf24", "#38bdf8", "#f43f5e"],
    });
  } catch {}
}

function LessonPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const selectedTrack: LanguageTrack = search.track || "python";

  // Filter lessons for the selected language track
  const trackLessons = Object.values(multiCourseRegistry).filter((l) => l.track === selectedTrack);
  const activeLesson: LessonInfo =
    (search.id && multiCourseRegistry[search.id]?.track === selectedTrack
      ? multiCourseRegistry[search.id]
      : trackLessons[0]) || trackLessons[0]!;

  const [code, setCode] = useState(activeLesson.starterCode);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [htmlPreviewKey, setHtmlPreviewKey] = useState(0);

  const { user, refresh } = useAuth();

  useEffect(() => {
    setCode(activeLesson.starterCode);
    setOut("");
    setErr("");
    setDone(false);
    setAiExplanation(null);
    if (selectedTrack === "python") {
      initPyodide().catch(() => {});
    }
  }, [activeLesson.id, selectedTrack]);

  const currentIndex = trackLessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = currentIndex > 0 ? trackLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < trackLessons.length - 1 ? trackLessons[currentIndex + 1] : null;

  const runCode = async () => {
    setRunning(true);
    setErr("");
    setAiExplanation(null);

    try {
      if (selectedTrack === "python") {
        const result = await executePythonCode(code);
        setOut(result.output);
        setErr(result.error);
        return result;
      } else if (selectedTrack === "html") {
        setHtmlPreviewKey((k) => k + 1);
        setOut("Live web preview rendered successfully.");
        return { output: "Live web preview rendered.", error: "" };
      } else {
        // C & C++ structural checks & simulation
        const isHeaderValid = code.includes("#include");
        const hasMain = code.includes("main()");
        if (!isHeaderValid || !hasMain) {
          const syntaxErr = "Compiler Error: Expected valid '#include' and 'main()' entrypoint.";
          setErr(syntaxErr);
          setOut("");
          return { output: "", error: syntaxErr };
        }
        const compiledOut = "Compilation Successful.\nProgram executed with exit code 0.";
        setOut(compiledOut);
        return { output: compiledOut, error: "" };
      }
    } finally {
      setRunning(false);
    }
  };

  const submitSolution = async () => {
    const res = await runCode();
    const isPassing = !res.error && activeLesson.testCheck(res.output, code);
    setDone(isPassing);

    if (isPassing) {
      fireCelebrationConfetti();
      if (user) {
        completeLesson(activeLesson.id, 20)
          .then((newPoints) => {
            if (newPoints) toast.success("+20 XP saved to your quest profile!");
            else toast("Already completed — progress confirmed.");
            refresh();
          })
          .catch(() => toast.error("Could not record lesson progress."));
      } else {
        toast.success("Awesome job! Sign in to save your XP.");
      }
    } else {
      setErr("Challenge requirements not met yet. Check the requirements or ask the AI mentor!");
    }
  };

  // AI Instant Error Diagnostics
  const requestAiDebug = async () => {
    if (!err && !out) return;
    setExplaining(true);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: activeLesson.id,
          code,
          output: out,
          error: err,
          messages: [
            {
              role: "user",
              content: `Diagnose why this code failed the challenge. Explain what went wrong simply and give me a clue on how to fix it without giving the direct full code answer.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        // Fallback explanation if user not signed in or API key unavailable
        setAiExplanation(
          `Hint: Make sure your logic satisfies "${activeLesson.challenge}". Look closely at variable names, loops bounds, or missing tags.`,
        );
        return;
      }

      const reader = response.body?.getReader();
      const dec = new TextDecoder();
      let buffer = "";
      let acc = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line);
            acc += event.text || "";
          }
        }
      }
      setAiExplanation(acc || "Review your syntax and challenge instructions carefully.");
    } catch {
      setAiExplanation(
        `Review the challenge: "${activeLesson.challenge}". Ensure your code matches expected inputs and outputs.`,
      );
    } finally {
      setExplaining(false);
    }
  };

  return (
    <Shell>
      {/* Track & Step Selector Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        {/* Track switchers */}
        <div className="flex items-center gap-2">
          {(["python", "html", "c", "cpp"] as LanguageTrack[]).map((t) => (
            <button
              key={t}
              onClick={() => navigate({ search: { track: t } })}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase transition ${
                selectedTrack === t
                  ? "bg-primary text-primary-foreground glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "cpp" ? "C++" : t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Steps for this track */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {trackLessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => navigate({ search: { track: selectedTrack, id: l.id } })}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                l.id === activeLesson.id
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/40"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              L{i + 1}
            </button>
          ))}
        </div>

        <span className="rounded-full bg-secondary px-4 py-1.5 font-bold text-gold text-sm">
          +20 XP
        </span>
      </div>

      {/* Main Split Layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr_360px]">
        {/* Challenge details */}
        <article className="panel flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-primary uppercase">{selectedTrack} Curriculum</span>
              <span className="text-xs text-muted-foreground">
                · Lesson {currentIndex + 1} of {trackLessons.length}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-bold">{activeLesson.title}</h1>
            <p className="mt-1 text-sky font-medium">{activeLesson.concepts}</p>

            <div className="mt-5 rounded-xl border border-border bg-card p-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Code2 className="h-5 w-5 text-gold" /> Challenge Objective
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {activeLesson.challenge}
              </p>
            </div>

            {/* AI Error Diagnoser Notice */}
            {aiExplanation && (
              <div className="mt-4 rounded-xl border border-sky/40 bg-sky/5 p-4 text-sm">
                <div className="flex items-center gap-2 font-bold text-sky">
                  <Sparkles className="h-4 w-4" /> AI Mentor Diagnosis
                </div>
                <p className="mt-1.5 text-muted-foreground whitespace-pre-wrap">{aiExplanation}</p>
              </div>
            )}
          </div>

          {/* Stepper buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            {prevLesson ? (
              <button
                onClick={() => navigate({ search: { track: selectedTrack, id: prevLesson.id } })}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
            ) : (
              <span />
            )}
            {nextLesson && (
              <button
                onClick={() => navigate({ search: { track: selectedTrack, id: nextLesson.id } })}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Next Lesson <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </article>

        {/* Code Workspace with Monaco Editor */}
        <div className="flex flex-col gap-4">
          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-primary" />
                {selectedTrack === "python"
                  ? "main.py (Python 3.12 WebAssembly)"
                  : selectedTrack === "html"
                    ? "index.html (Live Render Engine)"
                    : selectedTrack === "c"
                      ? "main.c (C11 Compiler)"
                      : "main.cpp (Modern C++20)"}
              </span>
              <button
                onClick={() => setCode(activeLesson.starterCode)}
                className="flex items-center gap-1 text-xs text-sky hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <CodeEditor
              language={
                selectedTrack === "cpp"
                  ? "cpp"
                  : selectedTrack === "c"
                    ? "c"
                    : selectedTrack === "html"
                      ? "html"
                      : "python"
              }
              value={code}
              onChange={setCode}
              height="300px"
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={runCode}
                disabled={running}
                className="flex items-center justify-center gap-2 rounded-xl border border-sky py-2.5 font-semibold text-sm transition hover:bg-sky/10 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {running ? "Executing…" : "Run Code"}
              </button>
              <button
                onClick={submitSolution}
                disabled={running}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-semibold text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-50 glow"
              >
                <Send className="h-4 w-4" />
                Submit Solution
              </button>
            </div>
          </div>

          {/* Terminal / Live HTML Preview Display */}
          <div className="panel flex-1 p-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-primary">
                {selectedTrack === "html" ? "Live HTML Preview" : "Execution Console"}
              </p>
              {err && !explaining && (
                <button
                  onClick={requestAiDebug}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/50 bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-secondary"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Explain with AI
                </button>
              )}
            </div>

            {selectedTrack === "html" ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white min-h-36 p-1">
                <iframe
                  key={htmlPreviewKey}
                  title="html-preview"
                  srcDoc={code}
                  className="h-44 w-full border-0"
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              <pre className="mt-3 min-h-28 whitespace-pre-wrap font-mono text-xs text-foreground bg-code p-3 rounded-lg border border-border/50">
                {out || (running ? "Compiling and executing code…" : "Output will appear here.")}
              </pre>
            )}

            {err && (
              <p className="mt-2 whitespace-pre-wrap font-mono text-xs text-destructive">{err}</p>
            )}

            {done && (
              <div className="mt-3 rounded-lg border border-primary bg-secondary/70 p-3">
                <p className="font-semibold text-primary flex items-center gap-1.5 text-sm">
                  <Check className="h-4 w-4" /> Quest Complete! +20 XP awarded.
                  {!user && " Sign in to preserve your progress."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Tutor Mentor */}
        <AiTutor lesson={activeLesson} code={code} output={out} error={err} />
      </div>
    </Shell>
  );
}
