import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock, Trophy, Play, Crown } from "lucide-react";
import { Shell } from "@/components/site";
import { avatars } from "@/lib/data";
import map from "@/assets/quest-map.jpg";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Python Quest Map — Questbound" },
      { name: "description", content: "Follow the Python quest path from beginner to adventurer." },
      { property: "og:title", content: "Python Quest Map — Questbound" },
      { property: "og:description", content: "Smaller steps. Bigger worlds." },
    ],
  }),
  component: MapPage,
});

const beginner = ["Welcome to Python", "Variables and Data Types", "Operators and Expressions", "Control Flow", "Functions", "Lists and Loops"];
const inter = ["File Handling", "Error Handling", "Modules and Packages", "Object-Oriented Programming", "Real-World Project"];

function MapPage() {
  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="flex items-center gap-5">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python logo" width={80} height={80} className="h-20 w-20" />
            <div><h1 className="text-4xl font-bold">Python Quest</h1><p className="text-muted-foreground">From curious beginner to Python adventurer.</p></div>
          </div>
          <section className="relative overflow-hidden rounded-2xl border border-border p-6">
            <img src={map} alt="" width={1280} height={896} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
            <h2 className="w-fit rounded-md bg-gold px-4 py-1 text-2xl font-bold text-primary-foreground">Beginner</h2>
            <ol className="mt-8 grid grid-cols-3 gap-6 md:grid-cols-6">
              {beginner.map((l, i) => (
                <li key={l} className="flex flex-col items-center text-center text-sm font-semibold">
                  {i === 4 ? (
                    <><span className="mb-1 rounded bg-foreground px-2 text-xs text-background">You are here!</span><img src={avatars.elf} alt="" width={56} height={56} className="h-14 w-14 rounded-full border-4 border-gold glow" /></>
                  ) : (
                    <span className={`flex h-14 w-14 items-center justify-center rounded-full border-4 ${i < 4 ? "border-primary bg-card text-primary" : "border-border bg-card text-muted-foreground"}`}>{i < 4 ? <Check /> : <Lock />}</span>
                  )}
                  <span className="mt-2 rounded bg-background/70 px-1">{i + 1}. {l}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="rounded-2xl border border-border bg-muted/60 p-6">
            <h2 className="text-2xl font-bold">Intermediate — Locked</h2>
            <p className="text-muted-foreground">Upgrade to continue your journey</p>
            <ol className="mt-6 grid grid-cols-3 gap-6 md:grid-cols-6">
              {inter.map((l, i) => (
                <li key={l} className="flex flex-col items-center text-center text-sm text-muted-foreground">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-border"><Lock className="h-4 w-4" /></span>
                  <span className="mt-2">{i + 7}. {l}</span>
                </li>
              ))}
              <li className="flex flex-col items-center text-center"><Trophy className="h-12 w-12 text-gold" /><span className="mt-2 font-bold text-destructive">LEVEL EXAM</span></li>
            </ol>
          </section>
        </div>
        <aside className="space-y-5">
          <div className="panel p-5"><h3 className="text-lg font-bold">Course Progress</h3><p className="mt-3 font-display text-4xl font-bold">42%</p><p className="text-sm text-muted-foreground">5 of 12 lessons completed</p><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 w-[42%] rounded-full bg-primary" /></div></div>
          <div className="panel p-5"><h3 className="text-lg font-bold">Next Lesson</h3><p className="mt-2 text-xl font-bold">5. Functions</p><p className="text-sm text-muted-foreground">Learn to write reusable code and unlock new powers. ~25 min</p><Link to="/lesson" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground"><Play className="h-4 w-4" />Start Lesson</Link></div>
          <div className="panel border-gold p-5"><h3 className="flex items-center gap-2 text-lg font-bold"><Crown className="h-5 w-5 text-gold" />Unlock All Levels</h3><p className="text-sm text-muted-foreground">Get full access to intermediate lessons, projects, and more.</p><Link to="/pricing" className="mt-4 block rounded-xl bg-gold py-3 text-center font-semibold text-primary-foreground">Upgrade to Pro</Link></div>
        </aside>
      </div>
    </Shell>
  );
}
