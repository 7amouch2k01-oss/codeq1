import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Swords, Clock, Play } from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { executePythonCode } from "@/lib/pyodide-runner";
import type { Database } from "@/integrations/supabase/types";

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

      // Check whether output satisfies the expected solution
      const cleaned = (exec.output || "").trim();
      const expected = battle.expected_output.trim();
      const ok = !exec.error && cleaned.includes(expected);

      if (!ok) {
        setResult("fail");
        return;
      }

      setResult("victory");

      if (!user) return;

      if (alreadyDone) {
        toast("You already completed today's battle — come back tomorrow!");
        return;
      }

      const { data } = await supabase.rpc("award_battle_xp");
      if (data) {
        toast.success(`+${battle.xp_reward} XP saved! Boss defeated.`);
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
          <div className="rounded-xl bg-code px-4 py-2">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Next battle in
            </span>
            <span className="font-mono text-2xl font-bold text-primary">{left}</span>
          </div>
        </div>

        {/* VS */}
        <div className="my-6 flex items-center justify-center gap-10 text-center">
          <div>
            <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-xl border-2 border-ember bg-muted text-2xl font-bold">
              PR
            </div>
            <div className="font-bold">PixelRogue</div>
            <div className="text-sm text-muted-foreground">Boss Level</div>
          </div>
          <span className="font-display text-4xl font-bold text-ember">VS</span>
          <div>
            <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-xl border-2 border-primary bg-muted text-2xl font-bold text-primary">
              {user ? (user.email ?? "U").slice(0, 2).toUpperCase() : "?"}
            </div>
            <div className="font-bold text-primary">{user ? "You" : "Guest"}</div>
            <div className="text-sm text-muted-foreground">
              {user ? (
                "Ready for battle"
              ) : (
                <Link to="/auth" className="text-primary underline">
                  Sign in to save XP
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Challenge details */}
        <div className="rounded-xl border border-border p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Today's Challenge</p>
              <h2 className="text-2xl font-bold">{battle.title}</h2>
            </div>
            <span className="h-fit rounded-md border border-primary px-3 py-1 text-sm font-semibold text-primary">
              {battle.difficulty}
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">{battle.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="rounded-lg bg-code p-3">
              <span className="text-muted-foreground">Sample Input:</span>
              <div className="mt-1 font-bold text-foreground">{battle.test_input}</div>
            </div>
            <div className="rounded-lg bg-code p-3">
              <span className="text-muted-foreground">Expected Output:</span>
              <div className="mt-1 font-bold text-gold">{battle.expected_output}</div>
            </div>
          </div>
        </div>

        {alreadyDone && (
          <div className="mt-4 rounded-xl border border-primary bg-secondary/60 px-5 py-3 text-center text-primary font-semibold">
            ✅ You already completed today's battle — come back tomorrow!
          </div>
        )}

        {/* Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={7}
          disabled={alreadyDone}
          className="mt-4 w-full resize-none rounded-xl bg-code p-4 font-mono text-sm outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
        />

        {/* Terminal Run Output */}
        {terminalOut && (
          <div className="mt-3 rounded-lg bg-code p-3 font-mono text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Execution output: </span>
            <span>{terminalOut}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-gold">
            <div className="text-sm text-muted-foreground">Reward</div>
            <div className="text-2xl font-bold">+{battle.xp_reward} XP</div>
          </div>
          <button
            onClick={submit}
            disabled={alreadyDone || submitting}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground glow transition hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {submitting ? "Testing Code…" : "Run & Submit"}
          </button>
        </div>

        {/* Result Message */}
        {result && (
          <p
            className={`mt-4 font-semibold ${
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
