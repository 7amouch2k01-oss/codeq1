import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Swords, Clock, Play, Sparkles, Shield, Flame, RotateCcw, Award } from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { executePythonCode } from "@/lib/pyodide-runner";
import { CodeEditor } from "@/components/code-editor";
import type { Database } from "@/integrations/supabase/types";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/sound-fx";

type DailyBattle = Database["public"]["Tables"]["daily_battles"]["Row"];

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Daily Boss Battle — Questbound" },
      {
        name: "description",
        content: "Engage in daily coding boss battles, defeat mythical monsters, and earn XP multipliers.",
      },
      { property: "og:title", content: "Daily Boss Battle — Questbound" },
      { property: "og:description", content: "Code today. Slay the Hydra tomorrow." },
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

interface CombatLog {
  id: number;
  type: "attack" | "hit" | "miss" | "victory";
  text: string;
}

export function Battle() {
  const [battle, setBattle] = useState<DailyBattle>(defaultBattle);
  const [code, setCode] = useState(defaultBattle.starter_code);
  const [left, setLeft] = useState("");
  const [result, setResult] = useState<"victory" | "fail" | null>(null);
  const [terminalOut, setTerminalOut] = useState("");
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();

  // Boss Combat Engine State
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp] = useState(100);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([
    { id: 1, type: "attack", text: "⚔️ An ancient Boss approaches! Prepare your syntax spell." },
  ]);
  const [isTakingDamage, setIsTakingDamage] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<string>("1.5x");

  // Redirect guests to /auth
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, loading, navigate]);

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
        if (data) {
          setAlreadyDone(true);
          setBossHp(0);
        }
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
        soundFx.playError();
        setResult("fail");
        setCombatLogs((prev) => [
          {
            id: Date.now(),
            type: "miss",
            text: `❌ Spell deflected! Output was '${cleaned || "empty"}' (Expected '${expected}').`,
          },
          ...prev.slice(0, 5),
        ]);
        return;
      }

      // Boss Hit Trigger
      soundFx.playBossHit();
      setIsTakingDamage(true);
      setTimeout(() => setIsTakingDamage(false), 600);
      setBossHp(0);

      // Victory Fanfare & Confetti
      setTimeout(() => {
        soundFx.playVictory();
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
      }, 200);

      setResult("victory");
      setCombatLogs((prev) => [
        {
          id: Date.now(),
          type: "victory",
          text: `💥 CRITICAL HIT! Boss took 100 DMG and vanished in code ether!`,
        },
        ...prev.slice(0, 5),
      ]);

      if (!user) return;

      if (alreadyDone) {
        toast("You already conquered today's daily boss! Return tomorrow for the next raid.");
        return;
      }

      const { data } = await supabase.rpc("award_battle_xp");
      if (data) {
        toast.success(`+${battle.xp_reward} XP & Speed Bonus secured! Boss has fallen.`);
        setAlreadyDone(true);
        refresh();
      } else {
        toast("Daily Boss already claimed — XP recorded earlier today.");
        setAlreadyDone(true);
      }
    } catch {
      soundFx.playError();
      toast.error("Syntax or runtime error in Python execution.");
    } finally {
      setSubmitting(false);
    }
  };

  const hpPercentage = Math.max(0, Math.min(100, (bossHp / bossMaxHp) * 100));

  return (
    <Shell>
      <div className="panel mx-auto max-w-4xl p-6">
        {/* Arena Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/80 border border-primary/40 glow">
              <Swords className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Daily Boss Battle</h1>
                <span className="rounded-full bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 text-xs font-bold uppercase">
                  Live Arena
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Defeat the daily monster before midnight UTC.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-border/80 bg-secondary/50 px-3.5 py-2 text-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-sky" /> Reset Timer
              </div>
              <p className="font-mono text-base font-bold text-foreground mt-0.5">{left || "00:00:00"}</p>
            </div>
            <div className="rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-2 text-center">
              <div className="flex items-center gap-1.5 text-xs text-gold font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Bounty
              </div>
              <p className="font-mono text-base font-bold text-gold mt-0.5">+{battle.xp_reward} XP</p>
            </div>
          </div>
        </div>

        {/* Boss Arena Stage Visualizer */}
        <div className={`mt-6 rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden ${
          isTakingDamage
            ? "border-destructive bg-destructive/10 animate-shake"
            : bossHp === 0
            ? "border-primary/50 bg-primary/5"
            : "border-border/80 bg-secondary/20"
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Animated Boss Sprite Avatar */}
            <div className="flex items-center gap-5">
              <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 transition-transform duration-300 ${
                bossHp === 0
                  ? "border-muted-foreground/30 bg-muted/40 grayscale"
                  : "border-destructive bg-destructive/20 glow shadow-lg shadow-destructive/20 scale-105"
              }`}>
                <span className="text-5xl select-none" role="img" aria-label="Boss Monster">
                  {bossHp === 0 ? "💀" : battle.difficulty === "Hard" ? "🐉" : battle.difficulty === "Medium" ? "👹" : "👾"}
                </span>
                {isTakingDamage && (
                  <span className="absolute -top-3 -right-2 rounded-md bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-black animate-bounce">
                    -100 DMG!
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {battle.difficulty === "Hard"
                      ? "The Big-O Behemoth"
                      : battle.difficulty === "Medium"
                      ? "The NullPointer Spectre"
                      : "The Syntax Hydra"}
                  </h2>
                  <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                    battle.difficulty === "Easy" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                    battle.difficulty === "Medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    Tier: {battle.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {bossHp === 0
                    ? "Monster defeated! Your daily XP bounty has been sealed into your ledger."
                    : "Wield valid algorithms to deplete the monster's defense bar."}
                </p>
              </div>
            </div>

            {/* Boss Health Bar */}
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-destructive font-mono">
                  <Flame className="h-3.5 w-3.5" /> Boss HP
                </span>
                <span className="font-mono text-muted-foreground">{bossHp} / {bossMaxHp}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-secondary border border-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-destructive via-amber-500 to-green-500 transition-all duration-500"
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[0.7rem] text-muted-foreground">
                <span>Speed Perk: <strong className="text-primary">{speedMultiplier} XP</strong></span>
                <span>Status: {bossHp === 0 ? "SLAIN" : "AGGRESSIVE"}</span>
              </div>
            </div>
          </div>

          {/* Combat Log Ticker */}
          <div className="mt-5 border-t border-border/50 pt-3">
            <p className="text-[0.7rem] text-muted-foreground uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1">
              <Shield className="h-3 w-3 text-primary" /> Arena Combat Log
            </p>
            <div className="space-y-1 font-mono text-xs">
              {combatLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-muted-foreground truncate">
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge Brief */}
        <div className="mt-6 rounded-xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" /> Quest Challenge: {battle.title}
            </h3>
            <span className="text-xs text-muted-foreground font-mono">Python 3 Sandbox</span>
          </div>
          <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{battle.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs font-mono bg-code p-2.5 rounded-lg border border-border">
            <span><strong>Target Output:</strong> <code className="text-primary">{battle.expected_output}</code></span>
          </div>
        </div>

        {/* Code Editor */}
        <div className="mt-6">
          <CodeEditor
            value={code}
            onChange={(val) => setCode(val)}
            language="python"
            height="260px"
          />
        </div>

        {/* Actions & Execution Output */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={submit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:opacity-90 transition glow disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              {submitting ? "Casting Spell..." : "Execute Attack"}
            </button>
            <button
              onClick={() => setCode(battle.starter_code)}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Starter
            </button>
          </div>

          {result === "victory" && (
            <span className="flex items-center gap-2 text-sm font-bold text-primary animate-pulse">
              <Sparkles className="h-4 w-4" /> Victory! Boss Defeated!
            </span>
          )}
          {result === "fail" && (
            <span className="flex items-center gap-2 text-sm font-bold text-destructive">
              Attack Failed — Test Cases Did Not Match
            </span>
          )}
        </div>

        {/* Terminal output */}
        {terminalOut && (
          <div className="mt-5 rounded-xl border border-border bg-code p-4 font-mono text-xs text-foreground">
            <p className="text-muted-foreground text-[0.7rem] uppercase font-bold mb-1">Execution Output:</p>
            <pre className="whitespace-pre-wrap">{terminalOut}</pre>
          </div>
        )}
      </div>
    </Shell>
  );
}
