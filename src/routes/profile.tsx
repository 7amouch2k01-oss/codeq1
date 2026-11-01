import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Star, Flame, BookOpen, Trophy, Shield, Download, UserCheck } from "lucide-react";
import { Shell } from "@/components/site";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { avatars } from "@/lib/data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Questbound" },
      {
        name: "description",
        content: "Your XP, streak, badges, course progress and certificates.",
      },
      { property: "og:title", content: "Profile — Questbound" },
      { property: "og:description", content: "Track your coding adventure." },
    ],
  }),
  component: Profile,
});

type CourseProgress = { course: string; completed: number; total: number };

const avatarOptions: { id: string; label: string; src: string }[] = [
  { id: "rogue", label: "Shadow Rogue", src: avatars.rogue },
  { id: "mage", label: "Arcane Mage", src: avatars.mage },
  { id: "king", label: "Grand Sovereign", src: avatars.king },
  { id: "elf", label: "Forest Ranger", src: avatars.elf },
];

const BADGE_THRESHOLDS = [
  {
    name: "First Steps",
    color: "border-primary text-primary",
    req: (xp: number, lessons: number) => lessons >= 1,
  },
  {
    name: "Python Novice",
    color: "border-sky text-sky",
    req: (xp: number, lessons: number) => lessons >= 3,
  },
  {
    name: "Streak Starter",
    color: "border-ember text-ember",
    req: (xp: number, _: number, streak: number) => streak >= 3,
  },
  {
    name: "Streak Master",
    color: "border-ember text-ember",
    req: (xp: number, _: number, streak: number) => streak >= 7,
  },
  { name: "Code Knight", color: "border-gold text-gold", req: (xp: number) => xp >= 100 },
  { name: "Problem Solver", color: "border-primary text-primary", req: (xp: number) => xp >= 500 },
  {
    name: "Consistent Coder",
    color: "border-sky text-sky",
    req: (xp: number, lessons: number) => lessons >= 10,
  },
  { name: "Algorithm Adept", color: "border-gold text-gold", req: (xp: number) => xp >= 2000 },
];

function rankTitle(xp: number) {
  if (xp >= 3000) return "Grand Coder";
  if (xp >= 2000) return "Algorithm Adept";
  if (xp >= 1500) return "Function Master";
  if (xp >= 1000) return "Code Knight";
  if (xp >= 500) return "Bug Hunter";
  return "Syntax Scholar";
}

const COURSE_LESSONS: Record<string, string[]> = {
  "Python Fundamentals": [
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
  "Web Development": [
    "html-1-intro",
    "html-2-forms",
    "html-3-css",
    "html-4-layout",
    "html-5-grid",
    "html-6-js",
  ],
  "C Systems Programming": [
    "c-1-intro",
    "c-2-pointers",
    "c-3-structs",
    "c-4-memory",
    "c-5-linked-lists",
    "c-6-bitwise",
  ],
  "Modern C++ Programming": [
    "cpp-1-intro",
    "cpp-2-oop",
    "cpp-3-templates",
    "cpp-4-stl",
    "cpp-5-smart-pointers",
    "cpp-6-game-loop",
  ],
  "SQL & Databases": [
    "sql-1-select",
    "sql-2-where",
    "sql-3-joins",
    "sql-4-aggregates",
  ],
  "Algorithms & Data Structures": [
    "dsa-1-recursion",
    "dsa-2-binary-search",
    "dsa-3-stacks",
    "dsa-4-queues",
  ],
};

function Profile() {
  const { user, profile, loading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<string[]>([]);
  const [exams, setExams] = useState<
    { exam_id: string; score: number; passed: boolean; taken_at: string }[]
  >([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  // Redirect guests to /auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
      supabase
        .from("exam_results")
        .select("exam_id, score, passed, taken_at")
        .eq("user_id", user.id)
        .order("taken_at", { ascending: false }),
    ]).then(([progressRes, examsRes]) => {
      const completedIds = (progressRes.data ?? []).map((r) => r.lesson_id);
      setLessons(completedIds);
      setExams(examsRes.data ?? []);

      const prog: CourseProgress[] = Object.entries(COURSE_LESSONS).map(([course, ids]) => ({
        course,
        completed: ids.filter((id) => completedIds.includes(id)).length,
        total: ids.length,
      }));
      setCourseProgress(prog);
      setDataLoading(false);
    });
  }, [user]);

  const selectAvatar = async (avatarId: string) => {
    if (!user || updatingAvatar) return;
    setUpdatingAvatar(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_id: avatarId } as any)
        .eq("id", user.id);
      if (error) {
        console.error("Avatar update error:", error);
        throw error;
      }
      toast.success("Avatar updated!");
      refresh();
    } catch (err: any) {
      console.error("Failed to update avatar:", err);
      toast.error(err?.message || "Failed to update avatar.");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  if (!user) {
    return (
      <Shell>
        <div className="panel mx-auto max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">Your profile</h1>
          <p className="mt-2 text-muted-foreground">Sign in to see your XP, streak and progress.</p>
          <Link
            to="/auth"
            className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  const xp = profile?.xp ?? 0;
  const streak = profile?.streak ?? 0;
  const level = Math.floor(xp / 100) + 1;
  const currentAvatarId = (profile as any)?.avatar_id || "rogue";
  const currentAvatar = avatarOptions.find((a) => a.id === currentAvatarId) || avatarOptions[0]!;
  const passed = exams.filter((e) => e.passed);
  const earnedBadges = BADGE_THRESHOLDS.filter((b) => b.req(xp, lessons.length, streak));

  return (
    <Shell>
      {/* Hero card */}
      <div className="panel p-6">
        <div className="flex flex-wrap items-center gap-6">
          <img
            src={currentAvatar.src}
            alt={currentAvatar.label}
            className="h-36 w-36 rounded-2xl border-2 border-primary object-cover glow"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold">{profile?.display_name ?? "Adventurer"}</h1>
            <p className="flex items-center gap-1.5 text-gold font-semibold">
              <Shield className="h-4 w-4" />
              {rankTitle(xp)} · {currentAvatar.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          {/* Level bar */}
          <div className="panel w-64 p-4">
            <p className="text-xl font-bold">Level {level}</p>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${xp % 100}%` }} />
            </div>
            <p className="mt-1 text-sm text-primary">{xp % 100} / 100 XP to next level</p>
          </div>
        </div>

        {/* Avatar Customizer */}
        <div className="mt-6 rounded-xl border border-border p-4">
          <p className="text-sm font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" /> Choose Your Adventurer Character:
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {avatarOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => selectAvatar(opt.id)}
                disabled={updatingAvatar}
                className={`flex items-center gap-3 rounded-lg border p-2 text-left transition ${
                  opt.id === currentAvatarId
                    ? "border-primary bg-secondary/80 ring-1 ring-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                <img src={opt.src} alt="" className="h-10 w-10 rounded-md object-cover" />
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            [Star, String(xp.toLocaleString()), "Total XP", "text-gold"],
            [Flame, String(streak), "Day Streak", "text-ember"],
            [BookOpen, String(lessons.length), "Lessons Done", "text-sky"],
            [Trophy, String(passed.length), "Certificates", "text-gold"],
          ].map(([I, v, l, c]) => {
            const Icon = I as typeof Star;
            return (
              <div key={l as string} className="panel flex items-center gap-3 p-4">
                <Icon className={`h-7 w-7 ${c}`} />
                <div>
                  <div className="text-2xl font-bold">{v as string}</div>
                  <div className="text-sm text-muted-foreground">{l as string}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges + Progress */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* Badges */}
          <div className="panel p-5">
            <h2 className="text-xl font-bold">Badges</h2>
            {dataLoading ? (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-4 gap-4 text-center text-xs">
                {BADGE_THRESHOLDS.map((b) => {
                  const earned = b.req(xp, lessons.length, streak);
                  return (
                    <div key={b.name} className={earned ? "" : "opacity-30"}>
                      <div
                        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-2 ${earned ? b.color : "border-border text-muted-foreground"}`}
                      >
                        <Shield className="h-6 w-6" />
                      </div>
                      <p className="mt-1">{b.name}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {earnedBadges.length} / {BADGE_THRESHOLDS.length} badges earned
            </p>
          </div>

          {/* Course progress */}
          <div className="panel p-5">
            <h2 className="text-xl font-bold">Course Progress</h2>
            {dataLoading ? (
              <div className="mt-4 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : (
              courseProgress.map(({ course, completed, total }) => (
                <div key={course} className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span>{course}</span>
                    <span className="text-muted-foreground">
                      {completed}/{total}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certificates */}
        <div className="panel mt-5 p-5">
          <h2 className="text-xl font-bold">Certificates</h2>
          {exams.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No exams taken yet —{" "}
              <Link to="/exam" className="text-primary">
                take a Certification Exam
              </Link>
              .
            </p>
          ) : (
            exams.map((c) => {
              const trackLabels: Record<string, { label: string; emoji: string }> = {
                python: { label: "Python Adventurer", emoji: "🐍" },
                html: { label: "Web Craft", emoji: "🌐" },
                c: { label: "C Systems Engineer", emoji: "⚙️" },
                cpp: { label: "Modern C++ Architect", emoji: "🏗️" },
                sql: { label: "Database Sage", emoji: "🗄️" },
                dsa: { label: "Algorithm Master", emoji: "⚡" },
              };
              // Support both "python" and "python-certification" exam_id formats
              const trackKey = c.exam_id.replace("-certification", "");
              const trackInfo = trackLabels[trackKey] || {
                label: c.exam_id,
                emoji: "🏅",
              };
              return (
                <div
                  key={c.exam_id + c.taken_at}
                  className="mt-3 flex items-center justify-between border-t border-border pt-3"
                >
                  <span className="text-sm">
                    {trackInfo.emoji} {trackInfo.label} Exam — {c.score}%{" "}
                    {c.passed ? "✅ Passed" : "❌ Not passed"} ·{" "}
                    {new Date(c.taken_at).toLocaleDateString()}
                  </span>
                  {c.passed && (
                    <Link
                      to="/certificate"
                      search={{ track: trackKey as any }}
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition"
                    >
                      <Download className="h-4 w-4" />
                      View Cert
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Shell>
  );
}
