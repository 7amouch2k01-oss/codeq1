import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Search, Crown } from "lucide-react";
import { Shell } from "@/components/site";
import { courses, levels } from "@/lib/data";
import mountains from "@/assets/bg-mountains.jpg";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Questbound" },
      { name: "description", content: "Choose your path: Python, HTML, C or C++ quests from beginner to expert." },
      { property: "og:title", content: "Choose your path — Questbound" },
      { property: "og:description", content: "Python, HTML, C and C++ coding quests." },
    ],
  }),
  component: Courses,
});

function Courses() {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const list = courses.filter((c) => (filter === "All" || c.name === filter) && c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Shell>
      <section className="relative overflow-hidden rounded-2xl px-8 py-12">
        <img src={mountains} alt="" width={1920} height={640} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <p className="eyebrow text-muted-foreground">Learn › Practice › Level up</p>
        <h1 className="mt-3 text-5xl font-bold">Choose your <span className="text-primary">path</span></h1>
        <p className="mt-2 text-lg text-muted-foreground">Master real skills. Complete quests. Become a better you.</p>
      </section>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["All", ...courses.map((c) => c.name)].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-5 py-2 ${filter === f ? "border-primary bg-secondary text-primary" : "border-border"}`}>{f}</button>
          ))}
        </div>
        <label className="panel flex items-center gap-2 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses..." className="bg-transparent outline-none" />
        </label>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {list.map((c) => (
          <div key={c.id} className="panel flex flex-col overflow-hidden">
            <div className="relative h-36">
              <img src={c.banner} alt="" loading="lazy" width={1088} height={608} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <img src={c.icon} alt={`${c.name} logo`} width={56} height={56} className="absolute bottom-2 left-5 h-14 w-14" />
            </div>
            <div className="flex flex-1 flex-col p-5">
            {c.popular && <span className="mb-2 flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-gold"><Crown className="h-3 w-3" />Most Popular</span>}
            <h2 className={`text-3xl font-bold ${c.color}`}>{c.name}</h2>
            <p className="mt-2 flex-1 text-muted-foreground">{c.blurb}</p>
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {levels.map((l, i) => (
                <div key={l} className={`flex flex-col items-center rounded-lg border p-2 text-[0.65rem] ${i === 0 ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                  <span className="truncate">{l}</span>
                  {i === 0 ? <span>Free</span> : <Lock className="mt-1 h-3.5 w-3.5" />}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm"><span>Progress: {c.progress} / 4 levels</span><span>{c.progress * 25}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${c.progress * 25}%` }} /></div>
            <Link to="/map" className="mt-5 rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground">Continue →</Link>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
