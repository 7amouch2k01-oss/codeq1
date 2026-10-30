import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, User, GraduationCap, Coins } from "lucide-react";
import { Shell } from "@/components/site";

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

const seed = [
  { n: "Alex Martin", e: "alex.martin@example.com", p: 100, r: 92, a: true },
  { n: "Sophie Chen", e: "sophie.chen@example.com", p: 78, r: 85, a: true },
  { n: "Marcus Lee", e: "marcus.lee@example.com", p: 45, r: 67, a: false },
  { n: "Priya Patel", e: "priya.patel@example.com", p: 92, r: 90, a: true },
  { n: "Daniel Kim", e: "daniel.kim@example.com", p: 31, r: 60, a: false },
];
const activity = [80, 110, 130, 140, 170, 200, 160, 190, 230, 250, 280, 260, 300, 340, 380, 360, 320, 290];

function Admin() {
  const [rows, setRows] = useState(seed);
  const max = 400;
  const pts = activity.map((v, i) => `${(i / (activity.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");
  return (
    <Shell>
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Track progress. Empower learners. Build a brighter future.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[[Users, "1,284", "Total students", "text-sky"], [User, "342", "Active today", "text-sky"], [GraduationCap, "89%", "Pass rate", "text-gold"], [Coins, "$12,460", "Revenue", "text-gold"]].map(([I, v, l, c]) => {
          const Icon = I as typeof Users;
          return <div key={l as string} className="panel p-5"><Icon className={`h-7 w-7 ${c}`} /><p className="mt-3 text-3xl font-bold">{v as string}</p><p className="text-sm text-muted-foreground">{l as string}</p></div>;
        })}
      </div>
      <div className="panel mt-5 p-5"><h2 className="text-xl font-bold">Student Activity</h2>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-48 w-full"><polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" /></svg>
      </div>
      <div className="panel mt-5 overflow-x-auto p-5"><h2 className="text-xl font-bold">Students</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-muted-foreground"><tr><th className="py-2">Name</th><th>Email</th><th>Progress</th><th>Pass rate</th><th>Access</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.e} className="border-t border-border">
              <td className="py-3">{r.n}</td><td className="text-muted-foreground">{r.e}</td>
              <td><div className="h-2 w-24 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${r.p}%` }} /></div></td>
              <td>{r.r}%</td>
              <td><button onClick={() => setRows(rows.map((x, k) => (k === i ? { ...x, a: !x.a } : x)))} className={`rounded-full px-3 py-1 ${r.a ? "bg-primary text-primary-foreground" : "border border-border"}`}>{r.a ? "Full access" : "Grant access"}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Shell>
  );
}
