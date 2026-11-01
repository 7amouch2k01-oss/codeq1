import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Lock, Trophy, Play, Crown } from "lucide-react";
import { Shell } from "@/components/site";
import map from "@/assets/quest-map.jpg";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { multiCourseRegistry, type LanguageTrack } from "@/lib/lesson-context";
import { z } from "zod";

const searchSchema = z.object({
  track: z.enum(["python", "html", "c", "cpp", "sql", "dsa"]).optional(),
});

export const Route = createFileRoute("/map")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Course Quest Map — Questbound" },
      {
        name: "description",
        content: "Follow your coding quest path across Python, Web, C, C++, SQL, and Algorithms.",
      },
      { property: "og:title", content: "Course Quest Map — Questbound" },
      { property: "og:description", content: "Smaller steps. Bigger worlds." },
    ],
  }),
  component: MapPage,
});

const trackMeta: Record<
  LanguageTrack,
  { name: string; logo: string; blurb: string; lockedCount: number }
> = {
  python: {
    name: "Python Quest",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    blurb: "From curious beginner to Python scripting adventurer.",
    lockedCount: 4,
  },
  html: {
    name: "Web Craft (HTML & CSS)",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    blurb: "Build beautiful, interactive websites from scratch.",
    lockedCount: 3,
  },
  c: {
    name: "C Systems Engineering",
    logo: "/c-logo.svg",
    blurb: "Master memory, pointers, and computer hardware fundamentals.",
    lockedCount: 4,
  },
  cpp: {
    name: "Modern C++ Quest",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    blurb: "Design games, high performance algorithms, and object architectures.",
    lockedCount: 4,
  },
  sql: {
    name: "SQL & Data Archives",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    blurb: "Query the ancient databases, master joins, and aggregate wisdom.",
    lockedCount: 3,
  },
  dsa: {
    name: "Algorithms & Labyrinth",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    blurb: "Solve recursions, navigate binary searches, and master stacks.",
    lockedCount: 3,
  },
};

function MapPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const currentTrack: LanguageTrack = search.track || "python";
  const { user, loading: authLoading } = useAuth();

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Redirect guests to /auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, authLoading, navigate]);

  const trackLessons = Object.values(multiCourseRegistry).filter((l) => l.track === currentTrack);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setCompleted(new Set((data ?? []).map((r) => r.lesson_id)));
        setLoading(false);
      });
  }, [user, currentTrack]);

  const completedCount = trackLessons.filter((l) => completed.has(l.id)).length;
  const total = trackLessons.length;
  const currentIndex = trackLessons.findIndex((l) => !completed.has(l.id));
  const activeLesson = trackLessons[currentIndex] || trackLessons[trackLessons.length - 1]!;

  return (
    <Shell>
      {/* Course track selector tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
        {(["python", "html", "c", "cpp"] as LanguageTrack[]).map((t) => (
          <button
            key={t}
            onClick={() => navigate({ search: { track: t } })}
            className={`rounded-xl px-4 py-2 text-sm font-bold uppercase transition flex items-center gap-2 ${
              currentTrack === t
                ? "bg-primary text-primary-foreground glow"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{t === "cpp" ? "C++" : t.toUpperCase()}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-5">
            <img
              src={trackMeta[currentTrack].logo}
              alt="Track logo"
              width={72}
              height={72}
              className="h-18 w-18 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold">{trackMeta[currentTrack].name}</h1>
              <p className="text-muted-foreground mt-1">{trackMeta[currentTrack].blurb}</p>
            </div>
          </div>

          {/* Active Track Path Map */}
          <section className="relative overflow-hidden rounded-2xl border border-border p-6 shadow-xl">
            <img
              src={map}
              alt=""
              width={1280}
              height={896}
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
            />
            <div className="flex items-center justify-between">
              <h2 className="w-fit rounded-lg bg-gold px-4 py-1 text-xl font-bold text-primary-foreground">
                Level 1: Novice Path
              </h2>
              <span className="text-xs font-mono font-bold bg-background/80 px-3 py-1 rounded-full border border-border">
                {completedCount} / {total} Completed
              </span>
            </div>

            <ol className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
              {trackLessons.map((lesson, i) => {
                const done = completed.has(lesson.id);
                const isCurrent = !loading && i === (currentIndex < 0 ? 0 : currentIndex);
                return (
                  <li
                    key={lesson.id}
                    className="flex flex-col items-center text-center text-xs font-semibold"
                  >
                    {isCurrent ? (
                      <>
                        <span className="mb-1 rounded bg-foreground px-1.5 py-0.5 text-[0.65rem] text-background font-bold">
                          Current Quest
                        </span>
                        <Link
                          to="/lesson"
                          search={{ track: currentTrack, id: lesson.id }}
                          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-gold bg-card glow"
                        >
                          <Play className="h-6 w-6 text-gold" />
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/lesson"
                        search={{ track: currentTrack, id: lesson.id }}
                        className={`flex h-14 w-14 items-center justify-center rounded-full border-4 transition hover:scale-105 ${
                          done
                            ? "border-primary bg-card text-primary"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                      </Link>
                    )}
                    <span className="mt-2 rounded bg-background/85 px-1.5 py-0.5 max-w-[110px] truncate">
                      {lesson.title.split(":")[1] || lesson.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Locked Advanced Tier */}
          <section className="rounded-2xl border border-border bg-muted/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Level 2: Grandmaster Quests</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Unlock advanced modules, database integrations, and complex algorithms.
                </p>
              </div>
              <Trophy className="h-8 w-8 text-gold" />
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
              <span className="text-xs font-semibold text-muted-foreground">
                Requires Pro Adventurer Membership
              </span>
              <Link
                to="/pricing"
                className="rounded-lg bg-gold px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Unlock Track
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="panel p-5">
            <h3 className="text-lg font-bold">Track Progress</h3>
            {loading ? (
              <div className="mt-3 h-8 animate-pulse rounded-xl bg-muted" />
            ) : (
              <>
                <p className="mt-3 font-display text-4xl font-bold">
                  {total > 0 ? Math.round((completedCount / total) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user
                    ? `${completedCount} of ${total} lessons conquered`
                    : "Sign in to record progress"}
                </p>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${(completedCount / total) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="panel p-5">
            <h3 className="text-lg font-bold">Next Challenge</h3>
            <p className="mt-2 text-base font-bold">{activeLesson.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {activeLesson.concepts}
            </p>
            <Link
              to="/lesson"
              search={{ track: currentTrack, id: activeLesson.id }}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-sm text-primary-foreground glow"
            >
              <Play className="h-4 w-4" /> Continue Quest
            </Link>
          </div>

          <div className="panel border-gold p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Crown className="h-5 w-5 text-gold" /> Lifetime Legend
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Gain access to all tracks (Python, Web, C, C++), certifications, and daily battles
              forever.
            </p>
            <Link
              to="/pricing"
              className="mt-4 block rounded-xl bg-gold py-2.5 text-center font-bold text-sm text-primary-foreground"
            >
              Upgrade Now
            </Link>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
