import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Coins,
  BarChart3,
  ShieldAlert,
  Search,
  Award,
  Swords,
  ScrollText,
  Trophy,
  BookOpen,
  ShieldCheck,
  RefreshCcw,
  Flame,
  Star,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Questbound" },
      { name: "description", content: "Manage learners, curriculum, and platform analytics." },
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
  avatar_id: string;
};

type CertRow = {
  user_id: string;
  exam_id: string;
  score: number;
  passed: boolean;
  taken_at: string;
  profiles: { display_name: string } | null;
};

type DailyBattle = {
  id: string;
  battle_date: string;
  title: string;
  difficulty: string;
  description: string;
  starter_code: string;
  expected_output: string;
  xp_reward: number;
};

const TABS = ["overview", "students", "certificates", "battles", "activity"] as const;
type Tab = (typeof TABS)[number];

function Admin() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("overview");
  const [students, setStudents] = useState<Student[]>([]);
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [battles, setBattles] = useState<DailyBattle[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completions: 0,
    exams: 0,
    certsPassed: 0,
    battlesTotal: 0,
  });
  const [query, setQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userLessons, setUserLessons] = useState<Record<string, number>>({});

  // New battle form
  const [newBattle, setNewBattle] = useState({
    title: "",
    difficulty: "Easy",
    description: "",
    starter_code: "",
    expected_output: "",
    xp_reward: 50,
    battle_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
  });
  const [savingBattle, setSavingBattle] = useState(false);

  // Auth guard
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (profile !== null && !(profile as any)?.is_admin) {
      toast.error("Access restricted: Administrator rights required.");
      navigate({ to: "/", replace: true });
    }
  }, [user, profile, loading, navigate]);

  const loadData = async () => {
    if (!(profile as any)?.is_admin) return;
    setDataLoading(true);
    try {
      const [profilesRes, lessonsRes, examsRes, certsRes, battlesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, xp, streak, created_at, is_admin, is_pro, avatar_id")
          .order("xp", { ascending: false }),
        supabase.from("lesson_progress").select("user_id, lesson_id"),
        supabase.from("exam_results").select("id", { count: "exact", head: true }),
        supabase
          .from("exam_results")
          .select("user_id, exam_id, score, passed, taken_at, profiles(display_name)")
          .eq("passed", true)
          .order("taken_at", { ascending: false })
          .limit(100),
        supabase
          .from("daily_battles")
          .select(
            "id, battle_date, title, difficulty, description, starter_code, expected_output, xp_reward",
          )
          .order("battle_date", { ascending: false }),
      ]);

      const studentsData = (profilesRes.data as Student[]) ?? [];
      setStudents(studentsData);
      setCerts((certsRes.data as unknown as CertRow[]) ?? []);
      setBattles((battlesRes.data as DailyBattle[]) ?? []);

      // Build per-user lesson count map
      const lessonMap: Record<string, number> = {};
      (lessonsRes.data ?? []).forEach((r: any) => {
        lessonMap[r.user_id] = (lessonMap[r.user_id] || 0) + 1;
      });
      setUserLessons(lessonMap);

      setStats({
        total: studentsData.length,
        completions: (lessonsRes.data ?? []).length,
        exams: examsRes.count ?? 0,
        certsPassed: (certsRes.data ?? []).length,
        battlesTotal: (battlesRes.data ?? []).length,
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const togglePro = async (studentId: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_pro: !current } as any)
      .eq("id", studentId);
    if (error) {
      toast.error("Could not update Pro status.");
      return;
    }
    toast.success(`Pro status ${!current ? "granted" : "revoked"}!`);
    loadData();
  };

  const toggleAdmin = async (studentId: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !current } as any)
      .eq("id", studentId);
    if (error) {
      toast.error("Could not update admin role.");
      return;
    }
    toast.success(`Admin role ${!current ? "granted" : "revoked"}!`);
    loadData();
  };

  const grantXpBonus = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const { error } = await supabase
      .from("profiles")
      .update({ xp: student.xp + 100 } as any)
      .eq("id", studentId);
    if (error) {
      toast.error("Could not award XP.");
      return;
    }
    toast.success("+100 XP awarded!");
    loadData();
  };

  const resetUserProgress = async (studentId: string, name: string) => {
    if (!confirm(`Reset ALL progress for ${name}? This cannot be undone.`)) return;
    await Promise.all([
      supabase.from("lesson_progress").delete().eq("user_id", studentId),
      supabase.from("exam_results").delete().eq("user_id", studentId),
      supabase.from("battle_completions").delete().eq("user_id", studentId),
      supabase.from("profiles").update({ xp: 0, streak: 0 } as any).eq("id", studentId),
    ]);
    toast.success(`Progress for ${name} has been reset.`);
    loadData();
  };

  const deleteBattle = async (id: string) => {
    if (!confirm("Delete this daily battle?")) return;
    const { error } = await supabase.from("daily_battles").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete battle.");
      return;
    }
    toast.success("Battle deleted.");
    loadData();
  };

  const addBattle = async () => {
    if (
      !newBattle.title ||
      !newBattle.description ||
      !newBattle.starter_code ||
      !newBattle.expected_output
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSavingBattle(true);
    const { error } = await supabase.from("daily_battles").insert({
      ...newBattle,
      solution_check: newBattle.title.toLowerCase().replace(/\s+/g, "_"),
      test_input: "",
    } as any);
    setSavingBattle(false);
    if (error) {
      toast.error("Could not add battle: " + error.message);
      return;
    }
    toast.success("Battle added!");
    setNewBattle({
      title: "",
      difficulty: "Easy",
      description: "",
      starter_code: "",
      expected_output: "",
      xp_reward: 50,
      battle_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    });
    loadData();
  };

  if (loading || dataLoading) {
    return (
      <Shell>
        <div className="space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-4 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
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

  const totalXP = students.reduce((acc, r) => acc + r.xp, 0);
  const filtered = students.filter((s) =>
    s.display_name.toLowerCase().includes(query.toLowerCase()),
  );

  const certExamLabels: Record<string, string> = {
    python: "🐍 Python Adventurer",
    "python-certification": "🐍 Python Adventurer",
    html: "🌐 Web Craft",
    "html-certification": "🌐 Web Craft",
    c: "⚙️ C Systems",
    "c-certification": "⚙️ C Systems",
    cpp: "🏗️ Modern C++",
    "cpp-certification": "🏗️ Modern C++",
  };

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Admin Management Portal</h1>
          <p className="text-muted-foreground">
            Full platform control — students, curriculum, certificates, analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh
          </button>
          <div className="rounded-xl border border-primary/40 bg-secondary/80 px-4 py-2 font-mono text-xs text-primary font-bold">
            ADMIN ACCESS VERIFIED
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { Icon: Users, v: stats.total, l: "Total Students", c: "text-sky" },
          { Icon: BookOpen, v: stats.completions, l: "Lessons Completed", c: "text-gold" },
          { Icon: BarChart3, v: stats.exams, l: "Exams Taken", c: "text-primary" },
          { Icon: ScrollText, v: stats.certsPassed, l: "Certificates Earned", c: "text-green-400" },
          { Icon: Coins, v: totalXP.toLocaleString(), l: "Platform XP Total", c: "text-ember" },
        ].map(({ Icon, v, l, c }) => (
          <div key={l} className="panel p-5">
            <Icon className={`h-7 w-7 ${c}`} />
            <p className="mt-3 text-3xl font-bold">
              {typeof v === "number" ? v.toLocaleString() : v}
            </p>
            <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">{l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 flex-wrap border-b border-border">
        {[
          { key: "overview", label: "Overview", Icon: BarChart3 },
          { key: "students", label: "Students", Icon: Users },
          { key: "certificates", label: "Certificates", Icon: ScrollText },
          { key: "battles", label: "Daily Battles", Icon: Swords },
          { key: "activity", label: "Top Performers", Icon: Trophy },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
              tab === key
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────── */}
      {tab === "overview" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="panel p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-green-400" /> Recent Certificates
            </h2>
            {certs.slice(0, 8).map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
              >
                <div>
                  <p className="font-semibold text-sm">{c.profiles?.display_name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {certExamLabels[c.exam_id] ?? c.exam_id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{c.score}%</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.taken_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {certs.length === 0 && (
              <p className="text-muted-foreground text-sm">No certificates earned yet.</p>
            )}
          </div>

          <div className="panel p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky" /> Recent Sign-ups
            </h2>
            {[...students]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 8)
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary">
                      {s.display_name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-semibold text-sm">{s.display_name}</span>
                    {s.is_pro && (
                      <span className="rounded-full bg-gold/20 px-1.5 text-[0.6rem] font-bold text-gold">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            {students.length === 0 && (
              <p className="text-muted-foreground text-sm">No students yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── STUDENTS ─────────────────────────────── */}
      {tab === "students" && (
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

          <div className="space-y-2">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-lg border border-border/40 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 hover:bg-muted/20 transition">
                  {/* Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary">
                      {r.display_name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm">{r.display_name}</span>
                        {r.is_admin && (
                          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[0.6rem] font-bold text-primary">
                            ADMIN
                          </span>
                        )}
                        {r.is_pro && (
                          <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[0.6rem] font-bold text-gold">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    {[
                      { v: r.xp.toLocaleString(), l: "XP", c: "text-gold" },
                      { v: r.streak, l: "Streak 🔥", c: "" },
                      { v: userLessons[r.id] ?? 0, l: "Lessons", c: "text-primary" },
                      { v: Math.floor(r.xp / 100) + 1, l: "Level", c: "" },
                    ].map(({ v, l, c }) => (
                      <div key={l} className="text-center hidden sm:block">
                        <p className={`font-bold ${c}`}>{v}</p>
                        <p className="text-[0.65rem] text-muted-foreground uppercase">{l}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
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
                    <button
                      onClick={() => toggleAdmin(r.id, r.is_admin)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                        r.is_admin
                          ? "border border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                          : "border border-border hover:bg-muted"
                      }`}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {r.is_admin ? "Revoke Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => setExpandedUser(expandedUser === r.id ? null : r.id)}
                      className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted transition"
                    >
                      {expandedUser === r.id ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded details + reset */}
                {expandedUser === r.id && (
                  <div className="border-t border-border/40 bg-muted/20 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      <strong>{userLessons[r.id] ?? 0}</strong> lessons done · Level{" "}
                      <strong>{Math.floor(r.xp / 100) + 1}</strong> · {r.streak} day streak ·{" "}
                      {r.xp} XP
                    </p>
                    <button
                      onClick={() => resetUserProgress(r.id, r.display_name)}
                      className="flex items-center gap-1.5 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" /> Reset All Progress
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                No students match &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── CERTIFICATES ─────────────────────────── */}
      {tab === "certificates" && (
        <div className="panel mt-6 p-5">
          <h2 className="text-xl font-bold mb-1">All Earned Certificates</h2>
          <p className="text-muted-foreground text-sm mb-5">
            Every passed certification exam across all language tracks.
          </p>

          {certs.length === 0 ? (
            <div className="py-12 text-center">
              <ScrollText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">
                No certificates earned yet. Students must pass an exam with ≥70%.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground uppercase border-b border-border/60">
                  <tr>
                    <th className="py-2.5">Student</th>
                    <th>Certificate</th>
                    <th>Score</th>
                    <th>Date Earned</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((c, i) => (
                    <tr key={i} className="border-t border-border/40 hover:bg-muted/30 transition">
                      <td className="py-3 font-semibold">
                        {c.profiles?.display_name ?? "Unknown"}
                      </td>
                      <td>{certExamLabels[c.exam_id] ?? c.exam_id}</td>
                      <td className="font-bold text-primary">{c.score}%</td>
                      <td className="text-muted-foreground text-xs">
                        {new Date(c.taken_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-green-400 font-bold text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Certified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── DAILY BATTLES ────────────────────────── */}
      {tab === "battles" && (
        <div className="mt-6 space-y-6">
          {/* Add form */}
          <div className="panel p-5">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add New Daily Battle
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Title
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-border bg-code px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Find Second Largest"
                  value={newBattle.title}
                  onChange={(e) => setNewBattle((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Difficulty
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-border bg-code px-3 py-2 text-sm outline-none focus:border-primary"
                  value={newBattle.difficulty}
                  onChange={(e) => setNewBattle((p) => ({ ...p, difficulty: e.target.value }))}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Battle Date
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-border bg-code px-3 py-2 text-sm outline-none focus:border-primary"
                  value={newBattle.battle_date}
                  onChange={(e) => setNewBattle((p) => ({ ...p, battle_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  XP Reward
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  className="mt-1 w-full rounded-lg border border-border bg-code px-3 py-2 text-sm outline-none focus:border-primary"
                  value={newBattle.xp_reward}
                  onChange={(e) =>
                    setNewBattle((p) => ({ ...p, xp_reward: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Description
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-border bg-code px-3 py-2 text-sm outline-none focus:border-primary h-20 resize-none"
                  placeholder="Describe the challenge…"
                  value={newBattle.description}
                  onChange={(e) => setNewBattle((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Starter Code
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-border bg-code px-3 py-2 text-sm font-mono outline-none focus:border-primary h-28 resize-none"
                  placeholder={"def solve(...):\n    pass"}
                  value={newBattle.starter_code}
                  onChange={(e) => setNewBattle((p) => ({ ...p, starter_code: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Expected Output
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-border bg-code px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                  placeholder="e.g. 5"
                  value={newBattle.expected_output}
                  onChange={(e) =>
                    setNewBattle((p) => ({ ...p, expected_output: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addBattle}
                  disabled={savingBattle}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                >
                  <Swords className="h-4 w-4" /> {savingBattle ? "Saving…" : "Add Battle"}
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="panel p-5">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Swords className="h-5 w-5 text-ember" /> Scheduled Battles ({battles.length})
            </h2>
            <div className="space-y-3">
              {battles.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/40 p-3 hover:bg-muted/20 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{b.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                          b.difficulty === "Easy"
                            ? "bg-green-500/20 text-green-400"
                            : b.difficulty === "Medium"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {b.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📅 {new Date(b.battle_date).toLocaleDateString()} · ⚡ {b.xp_reward} XP
                    </p>
                  </div>
                  <button
                    onClick={() => deleteBattle(b.id)}
                    className="rounded-lg border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {battles.length === 0 && (
                <p className="text-muted-foreground text-sm">No battles scheduled yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TOP PERFORMERS ───────────────────────── */}
      {tab === "activity" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="panel p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-gold" /> Top XP Earners
            </h2>
            {students.slice(0, 10).map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
              >
                <span
                  className={`w-6 text-center font-bold text-sm ${
                    i === 0
                      ? "text-gold"
                      : i === 1
                        ? "text-slate-300"
                        : i === 2
                          ? "text-amber-600"
                          : "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary shrink-0">
                  {s.display_name.slice(0, 2).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.display_name}</p>
                  <p className="text-xs text-muted-foreground">Level {Math.floor(s.xp / 100) + 1}</p>
                </div>
                <span className="font-bold text-gold font-mono text-sm">
                  {s.xp.toLocaleString()} XP
                </span>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-muted-foreground text-sm">No students yet.</p>
            )}
          </div>

          <div className="panel p-5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-ember" /> Longest Streaks
            </h2>
            {[...students]
              .sort((a, b) => b.streak - a.streak)
              .slice(0, 10)
              .map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
                >
                  <span
                    className={`w-6 text-center font-bold text-sm ${i === 0 ? "text-gold" : "text-muted-foreground"}`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary shrink-0">
                    {s.display_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.display_name}</p>
                  </div>
                  <span className="font-bold text-ember font-mono text-sm">
                    {s.streak} days 🔥
                  </span>
                </div>
              ))}
            {students.length === 0 && (
              <p className="text-muted-foreground text-sm">No students yet.</p>
            )}
          </div>

          <div className="panel p-5 lg:col-span-2">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Most Lessons Completed
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...students]
                .sort((a, b) => (userLessons[b.id] ?? 0) - (userLessons[a.id] ?? 0))
                .slice(0, 9)
                .map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-lg border border-border/40 p-3"
                  >
                    <span
                      className={`text-lg font-bold ${i === 0 ? "text-gold" : "text-muted-foreground"}`}
                    >
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{s.display_name}</p>
                      <p className="text-xs text-primary font-bold">
                        {userLessons[s.id] ?? 0} lessons done
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            {students.length === 0 && (
              <p className="text-muted-foreground text-sm">No students yet.</p>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
