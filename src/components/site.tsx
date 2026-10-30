import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import bgNight from "@/assets/bg-night.jpg";
import type { ReactNode } from "react";
import { Flame, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/courses", label: "Courses" },
  { to: "/battle", label: "Daily Battle" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/map", label: "Map" },
  { to: "/exam", label: "Exam" },
  { to: "/profile", label: "Profile" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src={logo} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
      <div className="leading-none">
        <div className="font-display text-xl font-bold">Questbound</div>
        <div className="eyebrow text-[0.6rem] text-muted-foreground">Code Academy</div>
      </div>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <img src={bgNight} alt="" aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover opacity-40" />
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Logo />
          <nav className="hidden gap-2 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <UserBox />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-muted-foreground">
          <Logo />
          <span className="eyebrow">Small steps. Bigger worlds.</span>
          <span>© 2026 Questbound</span>
        </div>
      </footer>
    </div>
  );
}

function UserBox() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  if (!user)
    return (
      <div className="flex gap-2">
        <Link to="/auth" className="rounded-lg border border-border px-4 py-2 text-sm">Sign in</Link>
        <Link to="/auth" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow">Start quest →</Link>
      </div>
    );
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="flex items-center gap-1 text-ember"><Flame className="h-4 w-4" />{profile?.streak ?? 0}</span>
      <span className="font-bold text-gold">{(profile?.xp ?? 0).toLocaleString()} XP</span>
      <Link to="/profile" className="font-semibold">{profile?.display_name ?? "You"}</Link>
      <button onClick={signOut} aria-label="Sign out" className="text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" /></button>
    </div>
  );
}
