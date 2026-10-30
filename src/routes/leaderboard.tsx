import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { Shell } from "@/components/site";
import { leaders } from "@/lib/data";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Weekly Leaderboard — Questbound" },
      { name: "description", content: "Top coders this week on Questbound." },
      { property: "og:title", content: "Weekly Leaderboard — Questbound" },
      { property: "og:description", content: "Top coders. Brighter tomorrows." },
    ],
  }),
  component: Board,
});

function Board() {
  const podium = [leaders[1], leaders[0], leaders[2]];
  return (
    <Shell>
      <div className="panel mx-auto max-w-3xl p-6">
        <div className="flex items-center gap-3"><Trophy className="h-10 w-10 text-gold" /><div><h1 className="text-4xl font-bold">Weekly Leaderboard</h1><p className="text-muted-foreground">Top coders. Brighter tomorrows.</p></div></div>
        <div className="mt-8 grid grid-cols-3 items-end gap-4 text-center">
          {podium.map((p, i) => (
            <div key={p.name}>
              <div className="font-bold">{p.name}</div>
              <div className="font-bold text-gold">{p.xp.toLocaleString()} XP</div>
              <div className={`mt-2 rounded-t-lg bg-secondary font-display text-3xl font-bold ${i === 1 ? "h-32 text-gold" : i === 0 ? "h-24" : "h-16 text-ember"} flex items-center justify-center`}>{[2, 1, 3][i]}</div>
            </div>
          ))}
        </div>
        <table className="mt-6 w-full text-left">
          <thead className="text-sm text-muted-foreground"><tr><th className="p-3">#</th><th>Player</th><th>Rank Title</th><th className="text-right">XP</th></tr></thead>
          <tbody>
            {leaders.slice(3).map((p, i) => (
              <tr key={p.name} className={p.me ? "outline outline-1 outline-primary text-primary" : "border-t border-border"}>
                <td className="p-3">{i + 4}</td><td>{p.name}</td><td className="text-muted-foreground">{p.title}</td><td className="pr-3 text-right font-semibold text-gold">{p.xp.toLocaleString()} XP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
