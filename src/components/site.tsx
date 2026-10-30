import { Link } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/courses", label: "Courses" },
  { to: "/battle", label: "Daily Battle" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <Swords className="h-8 w-8 text-primary" />
      <div className="leading-none">
        <div className="font-display text-xl font-bold">Questbound</div>
        <div className="eyebrow text-[0.6rem] text-muted-foreground">Code Academy</div>
      </div>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
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
          <Link to="/courses" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow">
            Start quest →
          </Link>
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
