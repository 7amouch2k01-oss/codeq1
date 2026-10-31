import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Terminal, Trophy, Star, Flame, Shield, Crown } from "lucide-react";
import { Shell } from "@/components/site";
import { courses } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import map from "@/assets/quest-map.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Questbound — Level up your code, one quest at a time" },
      {
        name: "description",
        content:
          "Learn Python, HTML, C and C++ through interactive coding quests, daily battles and leaderboards.",
      },
      { property: "og:title", content: "Questbound Code Academy" },
      {
        property: "og:description",
        content: "Learn to code through quests, battles and real projects.",
      },
    ],
  }),
  component: Home,
});

type Leader = { id: string; display_name: string; xp: number };

function Home() {
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, display_name, xp")
      .order("xp", { ascending: false })
      .limit(5)
      .then(({ data }) => setLeaders((data as Leader[]) ?? []));
  }, []);

  return (
    <Shell>
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-primary">Learn / Practice / Level up</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight md:text-6xl">
            Level up your code, <span className="text-primary">one quest</span> at a time.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Questbound makes coding fun with interactive quests, real projects, and a community that
            builds together.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/courses"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground glow"
            >
              Start your quest →
            </Link>
            <Link to="/battle" className="rounded-xl border border-border px-6 py-3 font-semibold">
              Today's battle
            </Link>
          </div>
        </div>
        <img
          src={map}
          alt="Quest map with a glowing path to a castle"
          width={1280}
          height={896}
          className="rounded-2xl glow"
        />
      </section>

      {/* Course icons */}
      <section className="panel mt-14 grid gap-4 p-6 sm:grid-cols-4">
        {courses.map((c) => (
          <Link
            key={c.id}
            to="/courses"
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary"
          >
            <img src={c.icon} alt={`${c.name} logo`} width={40} height={40} className="h-10 w-10" />
            <div>
              <div className={`font-display text-lg font-bold ${c.color}`}>{c.name}</div>
              <div className="text-sm text-muted-foreground">{c.blurb.split(",")[0]}</div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold">How it works</h2>
          <p className="text-muted-foreground">A simple path to real progress.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                i: BookOpen,
                t: "Learn",
                d: "Follow bite-sized lessons designed like quests.",
                c: "text-primary",
              },
              {
                i: Terminal,
                t: "Code",
                d: "Solve challenges and build real projects.",
                c: "text-sky",
              },
              {
                i: Trophy,
                t: "Conquer",
                d: "Earn XP, unlock badges, and climb the leaderboard.",
                c: "text-gold",
              },
            ].map(({ i: I, t, d, c }) => (
              <div key={t} className="panel p-5">
                <I className={`h-8 w-8 ${c}`} />
                <h3 className="mt-3 text-xl font-bold">{t}</h3>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <div className="panel mt-4 grid gap-4 p-6 md:grid-cols-3">
            {[
              { i: Star, v: "250K+", l: "XP earned by learners", c: "text-gold" },
              { i: Flame, v: "32", l: "day average streak", c: "text-ember" },
              { i: Shield, v: "18K+", l: "badges unlocked", c: "text-sky" },
            ].map(({ i: I, v, l, c }) => (
              <div key={l} className="flex items-center gap-3">
                <I className={`h-8 w-8 ${c}`} />
                <div>
                  <div className={`font-display text-3xl font-bold ${c}`}>{v}</div>
                  <div className="text-sm text-muted-foreground">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live leaderboard preview */}
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Crown className="h-5 w-5 text-gold" />
              Leaderboard
            </h3>
            <Link to="/leaderboard" className="text-sm text-primary">
              View all →
            </Link>
          </div>
          {leaders.length === 0 ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <ol className="mt-4 space-y-3">
              {leaders.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="text-muted-foreground">{i + 1}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-bold">
                      {p.display_name.slice(0, 2).toUpperCase()}
                    </span>
                    {p.display_name}
                  </span>
                  <span className="font-semibold text-gold">{p.xp.toLocaleString()} XP</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </Shell>
  );
}
