import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Award, CheckCircle2, RotateCcw, ChevronRight } from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { z } from "zod";

const searchSchema = z.object({
  track: z.enum(["python", "html", "c", "cpp"]).optional(),
});

export const Route = createFileRoute("/exam")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Certification Exams — Questbound" },
      {
        name: "description",
        content:
          "Test your skills across Python, Web, C, and C++ to earn official certificates and +100 XP.",
      },
      { property: "og:title", content: "Certification Exams — Questbound" },
    ],
  }),
  component: ExamPage,
});

type ExamQuestion = {
  id: number;
  question: string;
  code?: string;
  opts: string[];
  a: number; // correct index
  explanation: string;
};

const examRegistry: Record<
  string,
  { title: string; track: string; badge: string; questions: ExamQuestion[] }
> = {
  python: {
    title: "Python Adventurer Certification Exam",
    track: "Python",
    badge: "🐍 Certified Python Novice",
    questions: [
      {
        id: 1,
        question: "What will be printed by this code snippet?",
        code: "nums = [1, 2, 3]\nnums.append(4)\nprint(nums[2])",
        opts: ["1", "4", "3", "[1, 2, 3, 4]"],
        a: 2,
        explanation: "nums[2] accesses the element at index 2 (third item), which is 3.",
      },
      {
        id: 2,
        question: "What is the return value of len('quest')?",
        code: "print(len('quest'))",
        opts: ["4", "5", "6", "Error"],
        a: 1,
        explanation: "'quest' has 5 characters: q-u-e-s-t.",
      },
      {
        id: 3,
        question: "Evaluate the precedence:",
        code: "x = 3\nprint(x * 2 + 1)",
        opts: ["7", "8", "9", "6"],
        a: 0,
        explanation: "Multiplication precedes addition: (3 * 2) + 1 = 7.",
      },
      {
        id: 4,
        question: "What does integer floor division 10 // 3 yield?",
        code: "print(10 // 3)",
        opts: ["3.33", "3", "4", "1"],
        a: 1,
        explanation: "Floor division // discards decimals and rounds down to 3.",
      },
      {
        id: 5,
        question: "What is the result of string multiplication in Python?",
        code: "print('ab' * 2)",
        opts: ["ab2", "abab", "aabb", "TypeError"],
        a: 1,
        explanation: "'ab' * 2 repeats the string sequence twice: 'abab'.",
      },
      {
        id: 6,
        question: "What is the output of range(1, 4)?",
        code: "for n in range(1, 4):\n    print(n, end='')",
        opts: ["1234", "123", "0123", "14"],
        a: 1,
        explanation: "Python range(start, stop) excludes the stop value: 1, 2, 3.",
      },
      {
        id: 7,
        question: "How do you define a function in Python?",
        opts: ["function myFunc():", "def myFunc():", "fn myFunc() {}", "create myFunc()"],
        a: 1,
        explanation: "Python uses the 'def' keyword to define functions.",
      },
    ],
  },
  html: {
    title: "Web Craft (HTML/CSS) Certification Exam",
    track: "HTML/CSS",
    badge: "🌐 Certified Web Apprentice",
    questions: [
      {
        id: 1,
        question: "Which tag is used for the largest top-level heading in HTML?",
        opts: ["<heading>", "<h6>", "<h1>", "<head>"],
        a: 2,
        explanation: "<h1> defines the highest-level, most important heading.",
      },
      {
        id: 2,
        question: "How do you arrange child elements side-by-side using modern CSS?",
        opts: ["display: flex;", "align: horizontal;", "layout: row;", "float: center;"],
        a: 0,
        explanation: "display: flex enables Flexbox, arranging children in a row by default.",
      },
      {
        id: 3,
        question: "Which attribute is used to provide the destination URL in an <a> tag?",
        opts: ["src", "href", "link", "target"],
        a: 1,
        explanation: "<a href='...'> specifies the hyperlink destination.",
      },
      {
        id: 4,
        question: "Which CSS property rounds the corners of an element?",
        opts: ["border-radius", "corner-style", "border-round", "curve"],
        a: 0,
        explanation: "border-radius curves the corners of a box.",
      },
      {
        id: 5,
        question: "Where should metadata like <title> and stylesheet links be placed?",
        opts: ["<body>", "<head>", "<meta>", "<header>"],
        a: 1,
        explanation: "The <head> element contains document metadata.",
      },
    ],
  },
  c: {
    title: "C Systems Architecture Exam",
    track: "C",
    badge: "⚙️ Certified C Systems Coder",
    questions: [
      {
        id: 1,
        question: "What operator is used to obtain the memory address of a variable?",
        code: "int x = 10;\nint *ptr = ???;",
        opts: ["*x", "&x", "->x", "@x"],
        a: 1,
        explanation: "& is the address-of operator.",
      },
      {
        id: 2,
        question: "What function must be paired with malloc() to avoid memory leaks?",
        opts: ["delete()", "free()", "release()", "clear()"],
        a: 1,
        explanation: "Memory allocated with malloc() must be deallocated using free().",
      },
      {
        id: 3,
        question: "What does the 'sizeof' operator return?",
        opts: ["Memory address", "Value of the variable", "Size in bytes", "Length of string"],
        a: 2,
        explanation: "sizeof returns the size in bytes of a type or object.",
      },
      {
        id: 4,
        question: "What character terminates strings in C?",
        opts: ["'\\0' (null byte)", "'\\n'", "';'", "'EOF'"],
        a: 0,
        explanation: "C strings are null-terminated arrays of characters ending with '\\0'.",
      },
    ],
  },
  cpp: {
    title: "Modern C++ Object Architecture Exam",
    track: "C++",
    badge: "⚔️ Certified Modern C++ Architect",
    questions: [
      {
        id: 1,
        question: "Which header is required for console input/output streams in C++?",
        opts: ["<stdio.h>", "<iostream>", "<stream>", "<console>"],
        a: 1,
        explanation: "<iostream> provides std::cout and std::cin.",
      },
      {
        id: 2,
        question: "What is the standard dynamic contiguous array container in the STL?",
        opts: ["std::list", "std::vector", "std::array", "std::deque"],
        a: 1,
        explanation: "std::vector is the primary dynamic array container in C++.",
      },
      {
        id: 3,
        question: "Which keyword creates generic, type-independent functions and classes?",
        opts: ["generic", "template", "type", "virtual"],
        a: 1,
        explanation: "template <typename T> enables generic programming.",
      },
      {
        id: 4,
        question: "By default, members of a 'class' in C++ are:",
        opts: ["public", "private", "protected", "static"],
        a: 1,
        explanation: "Classes have private members by default (unlike struct, which is public).",
      },
    ],
  },
};

function ExamPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const currentTrack = search.track || "python";
  const exam = examRegistry[currentTrack] || examRegistry.python;

  const [i, setI] = useState(0);
  const [ans, setAns] = useState<number[]>([]);
  const [secs, setSecs] = useState(20 * 60);
  const [done, setDone] = useState(false);
  const { user, loading: authLoading, refresh } = useAuth();

  // Redirect guests to /auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, authLoading, navigate]);

  // Reset when switching tracks
  useEffect(() => {
    setI(0);
    setAns([]);
    setDone(false);
    setSecs(20 * 60);
  }, [currentTrack]);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const q = exam.questions[i]!;

  const finish = async () => {
    setDone(true);
    const score = Math.round(
      (ans.filter((a, k) => a === exam.questions[k]?.a).length / exam.questions.length) * 100,
    );
    const passed = score >= 70;

    if (passed) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }

    if (!user) return;

    try {
      const { error } = await supabase.from("exam_results").insert({
        user_id: user.id,
        exam_id: currentTrack,
        score,
        passed,
      });

      if (error) throw error;

      if (passed) {
        await supabase.rpc("award_xp", { _amount: 100 });
        toast.success(`Exam Passed! +100 XP awarded and Certificate ready.`);
      } else {
        toast("Exam recorded. Review the topics and try again!");
      }
      refresh();
    } catch {
      toast.error("Could not record exam score.");
    }
  };

  const score = Math.round(
    (ans.filter((a, k) => a === exam.questions[k]?.a).length / exam.questions.length) * 100,
  );
  const passed = score >= 70;

  return (
    <Shell>
      {/* Track Selection Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          {Object.keys(examRegistry).map((t) => (
            <button
              key={t}
              onClick={() => navigate({ search: { track: t as any } })}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase transition ${
                currentTrack === t
                  ? "bg-primary text-primary-foreground glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "cpp" ? "C++ Exam" : `${t.toUpperCase()} Exam`}
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-code px-3.5 py-1.5 font-mono text-sm font-bold text-gold border border-border/60 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="panel mx-auto max-w-3xl p-6">
        <div>
          <span className="eyebrow text-primary uppercase">{exam.track} Certification</span>
          <h1 className="mt-1 text-3xl font-bold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pass with 70%+ to claim your verified certificate and unlock the{" "}
            <span className="text-gold font-bold">{exam.badge}</span> credential.
          </p>
        </div>

        {done ? (
          <div className="mt-8 text-center p-6 rounded-2xl bg-card border border-border">
            <p className="font-display text-7xl font-bold text-primary">{score}%</p>
            <p className="mt-3 text-lg font-semibold">
              {passed ? (
                <span className="text-primary flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-6 w-6" /> Congratulations! You Passed the Exam!
                </span>
              ) : (
                <span className="text-destructive">
                  Score: {score}%. You need 70% to pass and earn your certificate.
                </span>
              )}
            </p>

            {passed ? (
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  to="/certificate"
                  search={{ track: currentTrack }}
                  className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground glow"
                >
                  View & Download Certificate →
                </Link>
                <Link
                  to="/courses"
                  className="rounded-xl border border-border px-6 py-3 font-semibold"
                >
                  Back to Courses
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAns([]);
                  setI(0);
                  setDone(false);
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-semibold hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </button>
            )}

            {/* Answer Explanations Review */}
            <div className="mt-8 text-left border-t border-border pt-6 space-y-4">
              <h3 className="text-base font-bold">Review Questions & Explanations:</h3>
              {exam.questions.map((qItem, idx) => {
                const userChoice = ans[idx];
                const isCorrect = userChoice === qItem.a;
                return (
                  <div
                    key={qItem.id}
                    className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      isCorrect
                        ? "border-primary/40 bg-primary/5"
                        : "border-destructive/40 bg-destructive/5"
                    }`}
                  >
                    <p className="font-bold text-foreground">
                      {idx + 1}. {qItem.question}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Your answer:{" "}
                      <span
                        className={
                          isCorrect ? "text-primary font-bold" : "text-destructive font-bold"
                        }
                      >
                        {userChoice !== undefined ? qItem.opts[userChoice] : "Unanswered"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-primary font-semibold">Correct: {qItem.opts[qItem.a]}</p>
                    )}
                    <p className="mt-1 italic text-muted-foreground">Why: {qItem.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Question {i + 1} of {exam.questions.length}
              </span>
              <span>Passing Requirement: 70%</span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((i + 1) / exam.questions.length) * 100}%` }}
              />
            </div>

            <h2 className="mt-6 text-xl font-bold leading-snug">{q.question}</h2>

            {q.code && (
              <pre className="mt-3 rounded-xl bg-code p-4 font-mono text-xs text-foreground border border-border/60">
                {q.code}
              </pre>
            )}

            <div className="mt-5 space-y-3">
              {q.opts.map((opt, k) => (
                <button
                  key={opt}
                  onClick={() => {
                    const next = [...ans];
                    next[i] = k;
                    setAns(next);
                  }}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left font-mono text-sm transition ${
                    ans[i] === k
                      ? "border-primary bg-secondary/80 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border ${
                      ans[i] === k
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {"ABCD"[k]}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button
                disabled={i === 0}
                onClick={() => setI(i - 1)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                ‹ Previous
              </button>
              <button
                disabled={ans[i] === undefined}
                onClick={() => (i === exam.questions.length - 1 ? finish() : setI(i + 1))}
                className="rounded-xl bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 glow"
              >
                {i === exam.questions.length - 1 ? "Submit Exam" : "Next Question ›"}
              </button>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
