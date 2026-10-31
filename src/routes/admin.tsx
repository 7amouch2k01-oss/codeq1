import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Coins,
  BarChart3,
  ShieldAlert,
  Search,
  Sparkles,
  Award,
} from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Questbound" },
      { name: "description", content: "Manage learners, examine analytics, and grant pro access." },
      { property: "og:title", content: "Admin Portal — Questbound" },
    ],
  }),
  component: Admin,
});

type Student = {
  id: string;
  display_name: string;
  xp: number;
  streak: number;
  created_at: string;
  is_admin: boolean;
  is_pro: boolean;
};

function Admin() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completions: 0, exams: 0 });
  const [query, setQuery] = useState("");

  // Auth guard: redirect non-admins immediately once auth + profile loading completes
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    // Check if profile is still loading or if user is admin
    if (profile !== null) {
      if (!(profile as any)?.is_admin) {
        toast.error("Access restricted: Administrator rights required.");
        navigate({ to: "/", replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  const loadData = () => {
    if (!(profile as any)?.is_admin) return;
    Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, xp, streak, created_at, is_admin, is_pro")
        .order("xp", { ascending: false }),
      supabase.from("lesson_progress").select("lesson_id", { count: "exact", head: true }),
      supabase.from("exam_results").select("id", { count: "exact", head: true }),
    ]).then(([profilesRes, lessonsRes, examsRes]) => {
      setStudents((profilesRes.data as Student[]) ?? []);
      setStats({
        total: profilesRes.data?.length ?? 0,
        completions: lessonsRes.count ?? 0,
        exams: examsRes.count ?? 0,
      });
      setDataLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const togglePro = async (studentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_pro: !currentStatus } as any)
        .eq("id", studentId);
      if (error) throw error;
      toast.success("Learner Pro status updated!");
      loadData();
    } catch {
      toast.error("Could not update Pro membership.");
    }
  };

  const grantXpBonus = async (studentId: string) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      const { error } = await supabase
        .from("profiles")
        .update({ xp: student.xp + 100 } as any)
        .eq("id", studentId);
      if (error) throw error;
      toast.success("+100 XP awarded to student!");
      loadData();
    } catch {
      toast.error("Could not award XP.");
    }
  };

  if (loading || dataLoading) {
    return (
      <Shell>
        <div className="space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (!(profile as any)?.is_admin) {
    return (
      <Shell>
        <div className="panel mx-auto max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-14 w-14 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">Admin permissions required.</p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Go home
          </Link>
        </div>
      </Shell>
    );
  }

  const filtered = students.filter((s) =>
    s.display_name.toLowerCase().includes(query.toLowerCase()),
  );

  const totalXP = students.reduce((acc, r) => acc + r.xp, 0);

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Admin Management Portal</h1>
          <p className="text-muted-foreground">
            Real-time learner activity, curriculum completions, and account management.
          </p>
        </div>
        <div className="rounded-xl border border-primary/40 bg-secondary/80 px-4 py-2 font-mono text-xs text-primary font-bold">
          ADMIN ACCESS VERIFIED
        </div>
      </div>

      {/* Analytics KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { Icon: Users, v: stats.total.toLocaleString(), l: "Total Registered", c: "text-sky" },
          {
            Icon: GraduationCap,
            v: stats.completions.toLocaleString(),
            l: "Quests Solved",
            c: "text-gold",
          },
          {
            Icon: BarChart3,
            v: stats.exams.toLocaleString(),
            l: "Exams Submitted",
            c: "text-primary",
          },
          { Icon: Coins, v: totalXP.toLocaleString(), l: "Platform XP Earned", c: "text-ember" },
        ].map(({ Icon, v, l, c }) => (
          <div key={l} className="panel p-5">
            <Icon className={`h-7 w-7 ${c}`} />
            <p className="mt-3 text-3xl font-bold">{v}</p>
            <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">{l}</p>
          </div>
        ))}
      </div>

      {/* Student Management Grid */}
      <div className="panel mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold">Students Directory ({students.length})</h2>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-code px-3 py-1.5 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name…"
              className="bg-transparent outline-none text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border/60">
              <tr>
                <th className="py-2.5">Student</th>
                <th>Total XP</th>
                <th>Streak</th>
                <th>Tier</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/40 hover:bg-muted/30 transition">
                  <td className="py-3 font-semibold flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary">
                      {r.display_name.slice(0, 2).toUpperCase()}
                    </span>
                    {r.display_name}
                    {r.is_admin && (
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary">
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className="text-gold font-bold font-mono">{r.xp.toLocaleString()} XP</td>
                  <td>{r.streak} days 🔥</td>
                  <td>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
                        r.is_pro
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.is_pro ? "PRO ADVENTURER" : "EXPLORER"}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => grantXpBonus(r.id)}
                        className="rounded-lg border border-gold/40 bg-gold/10 px-2 py-1 text-xs font-semibold text-gold hover:bg-gold/20 transition flex items-center gap-1"
                      >
                        <Award className="h-3 w-3" /> +100 XP
                      </button>
                      <button
                        onClick={() => togglePro(r.id, r.is_pro)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          r.is_pro
                            ? "border border-destructive/50 text-destructive hover:bg-destructive/10"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        {r.is_pro ? "Revoke Pro" : "Grant Pro"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
