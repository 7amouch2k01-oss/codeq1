import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Swords, Clock, Play, Sparkles } from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { executePythonCode } from "@/lib/pyodide-runner";
import { CodeEditor } from "@/components/code-editor";
import type { Database } from "@/integrations/supabase/types";
import confetti from "canvas-confetti";

type DailyBattle = Database["public"]["Tables"]["daily_battles"]["Row"];

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Daily Battle — Questbound" },
      {
        name: "description",
        content: "Compete in daily coding battles, defeat bosses and win XP.",
      },
      { property: "og:title", content: "Daily Battle — Questbound" },
      { property: "og:description", content: "Code today. Climb tomorrow." },
    ],
  }),
  component: Battle,
});

const defaultBattle: DailyBattle = {
  id: "default",
  battle_date: new Date().toISOString().slice(0, 10),
  title: "Reverse a String",
  difficulty: "Easy",
  description: "Given a string s, return a new string with the characters in reverse order.",
  starter_code: `def reverse_string(s):\n    # Write your code here\n    pass\n\nprint(reverse_string("hello"))\n`,
  solution_check: "reverse_string",
  test_input: "hello",
  expected_output: "olleh",
  xp_reward: 50,
  created_at: new Date().toISOString(),
};

function Battle() {
  const [battle, setBattle] = useState<DailyBattle>(defaultBattle);
  const [code, setCode] = useState(defaultBattle.starter_code);
  const [left, setLeft] = useState("");
  const [result, setResult] = useState<"victory" | "fail" | null>(null);
  const [terminalOut, setTerminalOut] = useState("");
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, refresh } = useAuth();

  // Load today's battle from database
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("daily_battles")
      .select("*")
      .eq("battle_date", today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBattle(data as DailyBattle);
          setCode(data.starter_code);
        }
      });
  }, []);

  // Countdown timer to midnight UTC
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setUTCHours(24, 0, 0, 0);
      const s = Math.floor((+end - +now) / 1000);
      setLeft(
        [s / 3600, (s % 3600) / 60, s % 60]
          .map((n) => String(Math.floor(n)).padStart(2, "0"))
          .join(":"),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Check if user already completed today's battle
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("battle_completions")
      .select("battle_date")
      .eq("user_id", user.id)
      .eq("battle_date", today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAlreadyDone(true);
      });
  }, [user]);

  const submit = async () => {
    setSubmitting(true);
    setResult(null);
    setTerminalOut("");

    try {
      const exec = await executePythonCode(code);
      setTerminalOut(exec.output || exec.error);

      const cleaned = (exec.output || "").trim();
      const expected = battle.expected_output.trim();
      const ok = !exec.error && cleaned.includes(expected);

      if (!ok) {
        setResult("fail");
        return;
      }

      setResult("victory");
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

      if (!user) return;

      if (alreadyDone) {
        toast("You already completed today's battle — come back tomorrow!");
        return;
      }

      const { data } = await supabase.rpc("award_battle_xp");
      if (data) {
        toast.success(`+${battle.xp_reward} XP saved! PixelRogue has been defeated.`);
        setAlreadyDone(true);
        refresh();
      } else {
        toast("Already completed today's battle — XP was saved earlier.");
        setAlreadyDone(true);
      }
    } catch {
      toast.error("Execution error — please check your Python code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="panel mx-auto max-w-3xl p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Swords className="h-10 w-10 text-gold" />
            <div>
              <h1 className="text-4xl font-bold">Daily Battle</h1>
              <p className="text-muted-foreground">Code today. Climb tomorrow.</p>
            </div>
          </div>
          <div className="rounded-xl bg-code px-4 py-2 border border-border/80">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Reset in
            </span>
            <span className="font-mono text-xl font-bold text-primary">{left}</span>
          </div>
        </div>

        {/* VS Boss Area */}
        <div className="my-6 flex items-center justify-center gap-10 text-center">
          <div>
            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-ember bg-muted text-2xl font-bold">
              PR
            </div>
            <div className="font-bold text-sm">PixelRogue</div>
            <div className="text-xs text-muted-foreground">Daily Boss</div>
          </div>
          <span className="font-display text-4xl font-bold text-ember">VS</span>
          <div>
            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary bg-muted text-2xl font-bold text-primary">
              {user ? (user.email ?? "U").slice(0, 2).toUpperCase() : "?"}
            </div>
            <div className="font-bold text-sm text-primary">{user ? "You" : "Guest"}</div>
            <div className="text-xs text-muted-foreground">
              {user ? (
                "Challenger"
              ) : (
                <Link to="/auth" className="text-primary underline">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Challenge description */}
        <div className="rounded-xl border border-border p-5 bg-card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                Daily Quest
              </p>
              <h2 className="text-2xl font-bold mt-1">{battle.title}</h2>
            </div>
            <span className="h-fit rounded-full border border-primary/50 bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              {battle.difficulty}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{battle.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="rounded-lg bg-code p-3 border border-border/40">
              <span className="text-muted-foreground">Input:</span>
              <div className="mt-1 font-bold text-foreground">{battle.test_input}</div>
            </div>
            <div className="rounded-lg bg-code p-3 border border-border/40">
              <span className="text-muted-foreground">Expected Return:</span>
              <div className="mt-1 font-bold text-gold">{battle.expected_output}</div>
            </div>
          </div>
        </div>

        {alreadyDone && (
          <div className="mt-4 rounded-xl border border-primary bg-secondary/60 px-5 py-3 text-center text-primary font-semibold text-sm">
            ✅ You already completed today's battle — check back tomorrow at 00:00 UTC!
          </div>
        )}

        {/* Monaco Editor */}
        <div className="mt-4">
          <CodeEditor
            language="python"
            value={code}
            onChange={setCode}
            height="240px"
            readOnly={alreadyDone}
          />
        </div>

        {/* Terminal Run Output */}
        {terminalOut && (
          <div className="mt-3 rounded-lg bg-code p-3 font-mono text-xs text-muted-foreground border border-border/50">
            <span className="font-semibold text-primary">Execution output: </span>
            <span>{terminalOut}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-gold">
            <div className="text-xs text-muted-foreground">Bounty</div>
            <div className="text-2xl font-bold">+{battle.xp_reward} XP</div>
          </div>
          <button
            onClick={submit}
            disabled={alreadyDone || submitting}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground glow transition hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {submitting ? "Testing Code…" : "Run & Battle"}
          </button>
        </div>

        {/* Result outcome */}
        {result && (
          <p
            className={`mt-4 font-semibold text-sm ${
              result === "victory" ? "text-primary" : "text-destructive"
            }`}
          >
            {result === "victory"
              ? user
                ? `Victory! +${battle.xp_reward} XP added to your quest.`
                : "Victory! Sign in to save your XP."
              : `Tests failed: expected output to include '${battle.expected_output}'.`}
          </p>
        )}
      </div>
    </Shell>
  );
}
