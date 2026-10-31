import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/site";
import logo from "@/assets/logo.png";
import mountains from "@/assets/bg-mountains.jpg";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const searchSchema = z.object({
  track: z.enum(["python", "html", "c", "cpp"]).optional(),
});

export const Route = createFileRoute("/certificate")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Certificate of Completion — Questbound" },
      {
        name: "description",
        content: "Your Questbound certification of completion.",
      },
      { property: "og:title", content: "Certificate of Completion — Questbound" },
    ],
  }),
  component: Cert,
});

const trackMeta: Record<
  string,
  { title: string; label: string; emoji: string; examId: string }
> = {
  python: {
    title: "Python Fundamentals",
    label: "Python Adventurer",
    emoji: "🐍",
    examId: "python",
  },
  html: {
    title: "Web Craft (HTML & CSS)",
    label: "Web Crafter",
    emoji: "🌐",
    examId: "html",
  },
  c: {
    title: "C Systems Engineering",
    label: "C Systems Engineer",
    emoji: "⚙️",
    examId: "c",
  },
  cpp: {
    title: "Modern C++",
    label: "C++ Architect",
    emoji: "🏗️",
    examId: "cpp",
  },
};

function Cert() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const track = search.track || "python";
  const meta = trackMeta[track] || trackMeta.python;

  const [exam, setExam] = useState<{ score: number; taken_at: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    // Look for the exact exam_id saved by the exam page
    supabase
      .from("exam_results")
      .select("score, taken_at")
      .eq("user_id", user.id)
      .eq("exam_id", meta.examId)
      .eq("passed", true)
      .order("taken_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setExam(data as { score: number; taken_at: string } | null);
        setLoading(false);
      });
  }, [user, track, meta.examId]);

  if (!user) {
    return (
      <Shell>
        <div className="panel mx-auto max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">Sign in to view your certificate</h1>
          <Link
            to="/auth"
            className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </Shell>
    );
  }

  if (!exam) {
    return (
      <Shell>
        <div className="panel mx-auto max-w-md p-8 text-center">
          <p className="text-4xl mb-4">{meta.emoji}</p>
          <h1 className="text-2xl font-bold">No certificate yet</h1>
          <p className="mt-2 text-muted-foreground">
            Pass the <strong>{meta.title}</strong> Exam with 70%+ to earn your certificate.
          </p>
          {/* Show other earned certs as options */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {Object.entries(trackMeta)
              .filter(([k]) => k !== track)
              .map(([k, m]) => (
                <button
                  key={k}
                  onClick={() => navigate({ to: "/certificate", search: { track: k as any } })}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
                >
                  {m.emoji} {m.label}
                </button>
              ))}
          </div>
          <Link
            to="/exam"
            search={{ track: track as any }}
            className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Take the {meta.label} Exam →
          </Link>
        </div>
      </Shell>
    );
  }

  // Deterministic cert ID from user id + track + year
  const certId = `QB-${track.toUpperCase()}-${new Date(exam.taken_at).getFullYear()}-${user.id.slice(0, 6).toUpperCase()}`;

  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <Link to="/profile" className="text-muted-foreground text-sm hover:text-foreground transition">
            ← Back to profile
          </Link>
          {/* Track switcher */}
          <div className="flex gap-2">
            {Object.entries(trackMeta).map(([k, m]) => (
              <button
                key={k}
                onClick={() => navigate({ to: "/certificate", search: { track: k as any } })}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  k === track
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Certificate card */}
        <div
          id="certificate"
          className="relative mt-2 overflow-hidden rounded-xl border-4 border-double border-gold p-10 text-center"
        >
          <img
            src={mountains}
            alt=""
            width={1920}
            height={640}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
          />
          <img src={logo} alt="" width={64} height={64} className="mx-auto h-16 w-16" />
          <p className="eyebrow mt-2 text-gold">Questbound Code Academy</p>
          <h1 className="mt-6 font-serif text-5xl text-gold">Certificate of Completion</h1>
          <p className="eyebrow mt-6">This certifies that</p>
          <p className="mt-2 text-4xl font-bold">{profile?.display_name ?? user.email}</p>
          <p className="eyebrow mt-6 text-gold">Has successfully completed</p>
          <p className="mt-2 font-serif text-3xl text-gold">
            {meta.emoji} {meta.title}
          </p>
          <p className="mt-1 text-muted-foreground text-sm font-semibold uppercase tracking-widest">
            {meta.label} Certification
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-left">
            <div>
              <p className="eyebrow text-muted-foreground">Final score</p>
              <p className="text-3xl font-bold text-primary">{exam.score}%</p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">
                {new Date(exam.taken_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Certificate ID</p>
              <p className="text-lg font-bold font-mono">{certId}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast("Link copied!");
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 font-semibold hover:bg-muted transition"
          >
            <Share2 className="h-4 w-4" />
            Share Certificate
          </button>
        </div>

        {/* Other certs */}
        <div className="mt-6 panel p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Other Certificates</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(trackMeta)
              .filter(([k]) => k !== track)
              .map(([k, m]) => (
                <button
                  key={k}
                  onClick={() => navigate({ to: "/certificate", search: { track: k as any } })}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
                >
                  {m.emoji} {m.label} Cert
                </button>
              ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
