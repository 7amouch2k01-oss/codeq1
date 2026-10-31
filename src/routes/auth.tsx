import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in & Register — Questbound" },
      {
        name: "description",
        content: "Sign in or create an account to save your XP, streaks and progress.",
      },
      { property: "og:title", content: "Sign in & Register — Questbound" },
      { property: "og:description", content: "Start your coding quest." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/profile" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        if (error) throw error;
        toast.success("Password reset instructions have been sent to your email!");
        setMode("in");
      } else if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, adventurer!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Registration successful! Check your email to confirm your account.");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication error.");
    } finally {
      setBusy(false);
    }
  };

  const social = async (p: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message);
  };

  return (
    <Shell>
      <div className="panel mx-auto max-w-md p-8">
        <h1 className="text-3xl font-bold">
          {mode === "forgot"
            ? "Recover Your Account"
            : mode === "in"
              ? "Welcome back, adventurer"
              : "Begin your quest"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "forgot"
            ? "Enter your email to receive a password reset link."
            : "Save your XP, streaks, and certificates across all coding tracks."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "up" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full rounded-lg border border-border bg-code px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-border bg-code px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          {mode !== "forgot" && (
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-border bg-code px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          )}

          {mode === "in" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-muted-foreground hover:text-primary transition"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50 glow transition"
          >
            {busy
              ? "Processing…"
              : mode === "forgot"
                ? "Send Reset Link"
                : mode === "in"
                  ? "Sign in"
                  : "Create account"}
          </button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="my-4 text-center text-xs text-muted-foreground uppercase tracking-wider">
              or continue with
            </div>
            <button
              onClick={() => social("google")}
              className="w-full rounded-xl border border-border py-2.5 font-semibold text-sm transition hover:bg-muted"
            >
              Continue with Google
            </button>
            <button onClick={() => social("lovable")} className="lovable-auth-button mt-2.5 w-full">
              Continue with Lovable
            </button>
          </>
        )}

        <div className="mt-5 text-center">
          {mode === "forgot" ? (
            <button onClick={() => setMode("in")} className="text-sm text-primary hover:underline">
              ← Back to Sign in
            </button>
          ) : (
            <button
              onClick={() => setMode(mode === "in" ? "up" : "in")}
              className="text-sm text-primary hover:underline"
            >
              {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}
