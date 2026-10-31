import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Swords, Clock, Play } from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

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
  const [result, setResult] = useState<"victory" | "fail" | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, refresh } = useAuth();

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setUTCHours(24, 0, 0, 0);
      const s = Math.floor((+end - +now) / 1000);
      setLeft(
        [s / 3600, (s % 3600) / 60, s % 60]
          .map((n) => String(Math.floor(n)).padStart(2, "0"))
          .join(":")
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
    const ok =
      /return\s+s\[::-1\]/.test(code) ||
      /return\s+["']{2}\.join\(reversed\(s\)\)/.test(code);

    if (!ok) {
      setResult("fail");
      return;
    }

    setResult("victory");

    if (!user) return; // show result but don't save

    if (alreadyDone) {
      toast("You already completed today's battle — come back tomorrow!");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await supabase.rpc("award_battle_xp");
      if (data) {
        toast.success("+50 XP saved! You beat PixelRogue.");
        setAlreadyDone(true);
        refresh();
      } else {
        toast("Already completed today's battle — XP saved earlier.");
        setAlreadyDone(true);
      }
    } catch {
      toast.error("Couldn't save your result — try again.");
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
              <Clock className="h-4 w-4" />Ends in
            </span>
            <span className="font-mono text-2xl font-bold text-primary">{left}</span>
          </div>
        </div>

        {/* VS */}
        <div className="my-6 flex items-center justify-center gap-10 text-center">
          <div>
            <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-xl border-2 border-ember bg-muted text-2xl font-bold">PR</div>
            <div className="font-bold">PixelRogue</div>
            <div className="text-sm text-muted-foreground">Level 12</div>
          </div>
          <span className="font-display text-4xl font-bold text-ember">VS</span>
          <div>
            <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-xl border-2 border-primary bg-muted text-2xl font-bold text-primary">
              {user ? user.email?.slice(0, 2).toUpperCase() : "?"}
            </div>
            <div className="font-bold text-primary">{user ? "You" : "Guest"}</div>
            <div className="text-sm text-muted-foreground">
              {user ? "Signed in" : (
                <Link to="/auth" className="text-primary underline">Sign in to save XP</Link>
              )}
            </div>
          </div>
        </div>

        {/* Challenge */}
        <div className="rounded-xl border border-border p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Challenge</p>
              <h2 className="text-2xl font-bold">Reverse a string</h2>
            </div>
            <span className="h-fit rounded-md border border-primary px-3 py-1 text-sm text-primary">Easy</span>
          </div>
          <p className="mt-2 text-muted-foreground">
            Given a string s, return a new string with the characters in reverse order.
          </p>
          <pre className="mt-3 font-mono text-sm">{`Input:  s = "hello"\nOutput: "olleh"`}</pre>
        </div>

        {/* Already done banner */}
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
          rows={6}
          disabled={alreadyDone}
          className="mt-4 w-full rounded-xl bg-code p-4 font-mono text-sm outline-none disabled:opacity-60"
        />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-gold">
            <div className="text-sm text-muted-foreground">Reward</div>
            <div className="text-2xl font-bold">+50 XP</div>
          </div>
          <button
            onClick={submit}
            disabled={alreadyDone || submitting}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground glow disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {submitting ? "Saving…" : "Submit Solution"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <p
            className={`mt-4 font-semibold ${
              result === "victory" ? "text-primary" : "text-destructive"
            }`}
          >
            {result === "victory"
              ? user
                ? "Victory! +50 XP saved!"
                : "Victory! Sign in to save your XP."
              : "Tests failed: reverse_string('hello') should return 'olleh'."}
          </p>
        )}
      </div>
    </Shell>
  );
}
