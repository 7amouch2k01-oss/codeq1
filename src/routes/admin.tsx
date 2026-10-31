import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, GraduationCap, Coins, BarChart3, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Questbound" },
      { name: "description", content: "Track learner progress and manage access." },
      { property: "og:title", content: "Admin Dashboard — Questbound" },
      { property: "og:description", content: "Track progress. Empower learners." },
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
};

function Admin() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completions: 0, exams: 0 });

  // ── Auth guard: redirect non-admins immediately ──
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    // @ts-expect-error is_admin added in 0001 migration
    if (!profile?.is_admin) {
      navigate({ to: "/", replace: true });
    }
  }, [user, profile, loading, navigate]);

  // ── Fetch real data ──
  useEffect(() => {
    // @ts-expect-error is_admin added in 0001 migration
    if (!profile?.is_admin) return;

    Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, xp, streak, created_at, is_admin")
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
    // @ts-expect-error is_admin added in 0001 migration
  }, [profile?.is_admin]);

  // Loading states
  if (loading || dataLoading) {
    return (
      <Shell>
        <div className="space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  // @ts-expect-error is_admin added in 0001 migration
  if (!profile?.is_admin) {
    return (
      <Shell>
        <div className="panel mx-auto max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-14 w-14 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You don't have admin privileges.</p>
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

  const totalXP = students.reduce((s, r) => s + r.xp, 0);

  return (
    <Shell>
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Track progress. Empower learners. Build a brighter future.
      </p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { Icon: Users, v: stats.total.toLocaleString(), l: "Total students", c: "text-sky" },
          {
            Icon: GraduationCap,
            v: stats.completions.toLocaleString(),
            l: "Lessons completed",
            c: "text-gold",
          },
          { Icon: BarChart3, v: stats.exams.toLocaleString(), l: "Exams taken", c: "text-primary" },
          { Icon: Coins, v: totalXP.toLocaleString(), l: "Total XP earned", c: "text-gold" },
        ].map(({ Icon, v, l, c }) => (
          <div key={l} className="panel p-5">
            <Icon className={`h-7 w-7 ${c}`} />
            <p className="mt-3 text-3xl font-bold">{v}</p>
            <p className="text-sm text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      {/* Students table */}
      <div className="panel mt-5 overflow-x-auto p-5">
        <h2 className="text-xl font-bold">Students ({students.length})</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-2">Name</th>
              <th>XP</th>
              <th>Streak</th>
              <th>Joined</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {students.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-3 font-medium">{r.display_name}</td>
                <td className="text-gold font-semibold">{r.xp.toLocaleString()}</td>
                <td>{r.streak} days</td>
                <td className="text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${r.is_admin ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
                  >
                    {r.is_admin ? "Admin" : "Student"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="mt-4 text-center text-muted-foreground">No students yet.</p>
        )}
      </div>
    </Shell>
  );
}
