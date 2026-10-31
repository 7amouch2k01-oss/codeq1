import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Shell } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { avatars } from "@/lib/data";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Questbound" },
      { name: "description", content: "Top coders on Questbound." },
      { property: "og:title", content: "Leaderboard — Questbound" },
      { property: "og:description", content: "Top coders. Brighter tomorrows." },
    ],
  }),
  component: Board,
});

type Leader = { id: string; display_name: string; xp: number; streak: number; avatar_id?: string };

const avatarMap: Record<string, string> = {
  rogue: avatars.rogue,
  mage: avatars.mage,
  king: avatars.king,
  elf: avatars.elf,
};

function rankTitle(xp: number) {
  if (xp >= 3000) return "Grand Coder";
  if (xp >= 2000) return "Algorithm Adept";
  if (xp >= 1500) return "Function Master";
  if (xp >= 1000) return "Code Knight";
  if (xp >= 500) return "Bug Hunter";
  return "Syntax Scholar";
}

function Board() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, display_name, xp, streak, avatar_id")
      .order("xp", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setLeaders((data as Leader[]) ?? []);
        setLoading(false);
      });
  }, []);

  const podium = [leaders[1], leaders[0], leaders[2]].filter(Boolean) as Leader[];

  return (
    <Shell>
      <div className="panel mx-auto max-w-3xl p-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-10 w-10 text-gold" />
          <div>
            <h1 className="text-4xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Top coders. Brighter tomorrows.</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <>
            {podium.length >= 3 && (
              <div className="mt-8 grid grid-cols-3 items-end gap-4 text-center">
                {podium.map((p, i) => (
                  <div key={p.id}>
                    <img
                      src={avatarMap[p.avatar_id || "rogue"] || avatars.rogue}
                      alt=""
                      className={`mx-auto mb-2 rounded-2xl border-2 object-cover ${
                        i === 1
                          ? "h-24 w-24 border-gold shadow-lg shadow-gold/20"
                          : "h-20 w-20 border-border"
                      }`}
                    />
                    <div className={`font-bold ${p.id === user?.id ? "text-primary" : ""}`}>
                      {p.display_name}
                      {p.id === user?.id && <span className="ml-1 text-xs">(you)</span>}
                    </div>
                    <div className="font-bold text-gold">{p.xp.toLocaleString()} XP</div>
                    <div
                      className={`mt-2 flex items-center justify-center rounded-t-lg bg-secondary font-display text-3xl font-bold ${
                        i === 1 ? "h-32 text-gold" : i === 0 ? "h-24" : "h-16 text-ember"
                      }`}
                    >
                      {[2, 1, 3][i]}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <table className="mt-6 w-full text-left">
              <thead className="text-sm text-muted-foreground">
                <tr>
                  <th className="p-3">#</th>
                  <th>Player</th>
                  <th>Rank</th>
                  <th className="text-right">XP</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((p, i) => (
                  <tr
                    key={p.id}
                    className={
                      p.id === user?.id
                        ? "outline outline-1 outline-primary text-primary"
                        : "border-t border-border"
                    }
                  >
                    <td className="p-3">{i + 1}</td>
                    <td>
                      <span className="flex items-center gap-3">
                        <img
                          src={avatarMap[p.avatar_id || "rogue"] || avatars.rogue}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg object-cover border border-border"
                        />
                        {p.display_name}
                        {p.id === user?.id && <span className="text-xs text-primary">(you)</span>}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{rankTitle(p.xp)}</td>
                    <td className="pr-3 text-right font-semibold text-gold">
                      {p.xp.toLocaleString()} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {leaders.length === 0 && (
              <p className="mt-8 text-center text-muted-foreground">
                No players yet — be the first to earn XP!
              </p>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
