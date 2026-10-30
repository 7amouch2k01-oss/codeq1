import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Flame, BookOpen, Trophy, Shield, Download } from "lucide-react";
import { Shell } from "@/components/site";
import { avatars } from "@/lib/data";

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
  return (
    <Shell>
      <div className="panel p-6">
        <div className="flex flex-wrap items-center gap-6">
          <img src={avatars.rogue} alt="Alex" width={160} height={160} className="h-40 w-40 rounded-xl border-2 border-border" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Alex</h1>
            <p className="flex items-center gap-1 text-gold"><Shield className="h-4 w-4" />Code Knight</p>
            <p className="mt-2 text-muted-foreground">"Small steps. Big software."</p>
          </div>
          <div className="panel w-64 p-4"><p className="text-xl font-bold">Level 6</p><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 w-[70%] rounded-full bg-primary" /></div><p className="mt-1 text-sm text-primary">420 / 600 XP</p></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[[Star, "420", "Total XP", "text-gold"], [Flame, "12", "Day Streak", "text-ember"], [BookOpen, "28", "Lessons Completed", "text-sky"], [Trophy, "3", "Certificates Earned", "text-gold"]].map(([I, v, l, c]) => {
            const Icon = I as typeof Star;
            return <div key={l as string} className="panel flex items-center gap-3 p-4"><Icon className={`h-7 w-7 ${c}`} /><div><div className="text-2xl font-bold">{v as string}</div><div className="text-sm text-muted-foreground">{l as string}</div></div></div>;
          })}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="panel p-5"><h2 className="text-xl font-bold">Badges</h2><div className="mt-4 grid grid-cols-4 gap-4 text-center text-xs">{badges.map((b, i) => <div key={b}><div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-2 ${["border-primary text-primary", "border-sky text-sky", "border-ember text-ember", "border-gold text-gold"][i % 4]}`}><Shield className="h-6 w-6" /></div><p className="mt-1">{b}</p></div>)}</div></div>
          <div className="panel p-5"><h2 className="text-xl font-bold">Course Progress</h2>{prog.map(([n, p]) => <div key={n} className="mt-4"><div className="flex justify-between text-sm"><span>{n}</span><span>{p}%</span></div><div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${p}%` }} /></div></div>)}</div>
        </div>
        <div className="panel mt-5 p-5"><h2 className="text-xl font-bold">Certificates</h2>{["Python Beginner Certificate", "Problem Solving Essentials", "Web Development Basics"].map((c) => <div key={c} className="mt-3 flex items-center justify-between border-t border-border pt-3"><span>{c}</span><Link to="/certificate" className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"><Download className="h-4 w-4" />View</Link></div>)}</div>
      </div>
    </Shell>
  );
}
