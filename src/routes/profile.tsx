import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Flame, BookOpen, Trophy, Shield, Download } from "lucide-react";
import { Shell } from "@/components/site";
import { avatars } from "@/lib/data";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Questbound" },
      { name: "description", content: "Your XP, streak, badges, course progress and certificates." },
      { property: "og:title", content: "Profile — Questbound" },
      { property: "og:description", content: "Track your coding adventure." },
    ],
  }),
  component: Profile,
});

const badges = ["First Steps", "Python Novice", "Streak Master", "Code Knight", "Problem Solver", "Helpful Hero", "Consistent Coder"];
const prog = [["Python Fundamentals", 90], ["Data Structures", 40], ["Web Development", 20], ["Algorithms", 0]] as const;

function Profile() {
  const { user, profile } = useAuth();
  const [lessons, setLessons] = useState(0);
  const [exams, setExams] = useState<{ exam_id: string; score: number; passed: boolean; taken_at: string }[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("lesson_progress").select("lesson_id", { count: "exact", head: true }).then(({ count }) => setLessons(count ?? 0));
    supabase.from("exam_results").select("exam_id, score, passed, taken_at").order("taken_at", { ascending: false }).then(({ data }) => setExams(data ?? []));
  }, [user]);
  if (!user) return <Shell><div className="panel mx-auto max-w-md p-8 text-center"><h1 className="text-2xl font-bold">Your profile</h1><p className="mt-2 text-muted-foreground">Sign in to see your XP, streak and progress.</p><Link to="/auth" className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">Sign in</Link></div></Shell>;
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / 100) + 1;
  const passed = exams.filter((e) => e.passed);
  return (
    <Shell>
      <div className="panel p-6">
        <div className="flex flex-wrap items-center gap-6">
          <img src={avatars.rogue} alt="Alex" width={160} height={160} className="h-40 w-40 rounded-xl border-2 border-border" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{profile?.display_name}</h1>
            <p className="flex items-center gap-1 text-gold"><Shield className="h-4 w-4" />Code Knight</p>
            <p className="mt-2 text-muted-foreground">"Small steps. Big software."</p>
          </div>
          <div className="panel w-64 p-4"><p className="text-xl font-bold">Level {level}</p><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${xp % 100}%` }} /></div><p className="mt-1 text-sm text-primary">{xp % 100} / 100 XP to next level</p></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[[Star, String(xp), "Total XP", "text-gold"], [Flame, String(profile?.streak ?? 0), "Day Streak", "text-ember"], [BookOpen, String(lessons), "Lessons Completed", "text-sky"], [Trophy, String(passed.length), "Certificates Earned", "text-gold"]].map(([I, v, l, c]) => {
            const Icon = I as typeof Star;
            return <div key={l as string} className="panel flex items-center gap-3 p-4"><Icon className={`h-7 w-7 ${c}`} /><div><div className="text-2xl font-bold">{v as string}</div><div className="text-sm text-muted-foreground">{l as string}</div></div></div>;
          })}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="panel p-5"><h2 className="text-xl font-bold">Badges</h2><div className="mt-4 grid grid-cols-4 gap-4 text-center text-xs">{badges.map((b, i) => <div key={b}><div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-2 ${["border-primary text-primary", "border-sky text-sky", "border-ember text-ember", "border-gold text-gold"][i % 4]}`}><Shield className="h-6 w-6" /></div><p className="mt-1">{b}</p></div>)}</div></div>
          <div className="panel p-5"><h2 className="text-xl font-bold">Course Progress</h2>{prog.map(([n, p]) => <div key={n} className="mt-4"><div className="flex justify-between text-sm"><span>{n}</span><span>{p}%</span></div><div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${p}%` }} /></div></div>)}</div>
        </div>
        <div className="panel mt-5 p-5"><h2 className="text-xl font-bold">Certificates</h2>{exams.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No exams taken yet — <Link to="/exam" className="text-primary">take the Python Beginner Exam</Link>.</p>}{exams.map((c) => <div key={c.taken_at} className="mt-3 flex items-center justify-between border-t border-border pt-3"><span>Python Beginner Exam — {c.score}% {c.passed ? "✅ Passed" : "❌ Not passed"} · {new Date(c.taken_at).toLocaleDateString()}</span><Link to="/certificate" className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"><Download className="h-4 w-4" />View</Link></div>)}</div>
      </div>
    </Shell>
  );
}
