import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Sparkles, UserPlus } from "lucide-react";
import { Shell } from "@/components/site";
import { courses } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import mountains from "@/assets/bg-mountains.jpg";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Course Catalog — Questbound" },
      {
        name: "description",
        content: "Explore gamified coding paths in Python, Web Craft, C, and Modern C++.",
      },
      { property: "og:title", content: "Course Catalog — Questbound" },
    ],
  }),
  component: CoursesPage,
});

const COURSE_LESSON_IDS: Record<string, string[]> = {
  python: [
    "python-1-variables",
    "python-2-conditionals",
    "python-3-functions",
    "python-4-loops",
    "python-5-projects",
    "python-6-lists",
    "python-7-dictionaries",
    "python-8-exceptions",
    "python-9-classes",
    "python-10-capstone",
  ],
  html: [
    "html-1-intro",
    "html-2-forms",
    "html-3-css",
    "html-4-layout",
    "html-5-grid",
    "html-6-js",
  ],
  c: [
    "c-1-intro",
    "c-2-pointers",
    "c-3-structs",
    "c-4-memory",
    "c-5-linked-lists",
    "c-6-bitwise",
  ],
  cpp: [
    "cpp-1-intro",
    "cpp-2-oop",
    "cpp-3-templates",
    "cpp-4-stl",
    "cpp-5-smart-pointers",
    "cpp-6-game-loop",
  ],
  sql: [
    "sql-1-select",
    "sql-2-where",
    "sql-3-joins",
    "sql-4-aggregates",
  ],
  dsa: [
    "dsa-1-recursion",
    "dsa-2-binary-search",
    "dsa-3-stacks",
    "dsa-4-queues",
  ],
};

function CoursesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const completed = new Set((data ?? []).map((r) => r.lesson_id));
        const map: Record<string, number> = {};
        for (const [courseId, ids] of Object.entries(COURSE_LESSON_IDS)) {
          const done = ids.filter((id) => completed.has(id)).length;
          map[courseId] = done;
        }
        setProgressMap(map);
      });
  }, [user]);

  return (
    <Shell>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl px-8 py-12 border border-border/80 shadow-2xl">
        <img
          src={mountains}
          alt=""
          width={1920}
          height={640}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
        />
        <p className="eyebrow text-gold">Mastery Pathways</p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight">
          Choose Your <span className="text-primary">Coding Adventure</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Four distinct mastery tracks with real browser execution, gamified XP, certification
          exams, and interactive AI mentoring.
        </p>
      </section>

      {/* Mandatory Account Gate Banner for Non-Authenticated Learners */}
      {!loading && !user && (
        <div className="mt-8 rounded-2xl border-2 border-primary/50 bg-secondary/80 p-6 flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Account Registration Required</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create a free adventurer account to save your XP, track lesson milestones, and climb
                the leaderboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground glow transition hover:opacity-90 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> Create Free Account
            </Link>
          </div>
        </div>
      )}

      {/* Courses Cards Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {courses.map((c) => {
          const totalLessons = COURSE_LESSON_IDS[c.id]?.length || 4;
          const completedCount = progressMap[c.id] || 0;
          const percent = Math.round((completedCount / totalLessons) * 100);

          return (
            <div
              key={c.id}
              className="panel flex flex-col overflow-hidden border border-border/80 hover:border-primary/50 transition-all shadow-md group"
            >
              <div className="relative h-40">
                <img
                  src={c.banner}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <img
                  src={c.icon}
                  alt={`${c.name} logo`}
                  className="absolute bottom-3 left-5 h-12 w-12 drop-shadow-lg"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${c.color}`}>{c.name}</h2>
                  <span className="text-xs font-mono font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                    {totalLessons} Quests
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground flex-1 leading-relaxed">
                  {c.blurb}
                </p>

                {/* Level / Progress status */}
                <div className="mt-5 border-t border-border/50 pt-4">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
                    <span>Course Progress</span>
                    <span className="font-bold text-foreground">
                      {user
                        ? `${completedCount}/${totalLessons} (${percent}%)`
                        : "Locked (Sign in)"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: user ? `${percent}%` : "0%" }}
                    />
                  </div>
                </div>

                {/* Primary CTA */}
                {user ? (
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link
                      to="/map"
                      search={{ track: c.id as any }}
                      className="rounded-xl border border-border bg-card py-2.5 text-center text-xs font-bold text-foreground hover:bg-muted transition"
                    >
                      Quest Map
                    </Link>
                    <Link
                      to="/lesson"
                      search={{ track: c.id as any }}
                      className="rounded-xl bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground glow hover:opacity-90 transition"
                    >
                      {completedCount > 0 ? "Continue →" : "Start Quest →"}
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="mt-5 rounded-xl bg-primary/90 py-2.5 text-center text-xs font-bold text-primary-foreground transition hover:opacity-100 flex items-center justify-center gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5" /> Sign In to Unlock
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
