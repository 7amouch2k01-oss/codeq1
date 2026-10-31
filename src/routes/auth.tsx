import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
      { title: "Sign in — Questbound" },
      { name: "description", content: "Sign in to save your XP, streaks and progress." },
      { property: "og:title", content: "Sign in — Questbound" },
      { property: "og:description", content: "Start your coding quest." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
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
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin, data: { display_name: name } },
          });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (mode === "up") toast.success("Check your email to confirm your account.");
  };
  const social = async (p: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message);
  };

  return (
    <Shell>
      <div className="panel mx-auto max-w-md p-8">
        <h1 className="text-3xl font-bold">
          {mode === "in" ? "Welcome back, adventurer" : "Begin your quest"}
        </h1>
        <p className="mt-1 text-muted-foreground">Save your XP, streaks and progress.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "up" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full rounded-lg border border-border bg-code px-4 py-3 outline-none"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-border bg-code px-4 py-3 outline-none"
          />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-border bg-code px-4 py-3 outline-none"
          />
          <button
            disabled={busy}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="my-4 text-center text-sm text-muted-foreground">or</div>
        <button
          onClick={() => social("google")}
          className="w-full rounded-xl border border-border py-3 font-semibold"
        >
          Continue with Google
        </button>
        <button onClick={() => social("lovable")} className="lovable-auth-button mt-3 w-full">
          Continue with Lovable
        </button>
        <button
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-5 w-full text-sm text-primary"
        >
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </Shell>
  );
}
