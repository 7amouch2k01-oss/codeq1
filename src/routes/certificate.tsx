import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/site";
import logo from "@/assets/logo.png";
import mountains from "@/assets/bg-mountains.jpg";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/certificate")({
  head: () => ({
    meta: [
      { title: "Certificate of Completion — Questbound" },
      { name: "description", content: "Python Beginner Level certificate of completion." },
      { property: "og:title", content: "Certificate of Completion — Questbound" },
      { property: "og:description", content: "Python — Beginner Level, verified by Questbound." },
    ],
  }),
  component: Cert,
});

function Cert() {
  const { user, profile } = useAuth();
  const [exam, setExam] = useState<{ score: number; taken_at: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("exam_results")
      .select("score, taken_at")
      .eq("user_id", user.id)
      .eq("exam_id", "python-beginner")
      .eq("passed", true)
      .order("taken_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setExam(data as { score: number; taken_at: string } | null);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <Shell>
        <div className="panel mx-auto max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">Sign in to view your certificate</h1>
          <Link to="/auth" className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">Sign in</Link>
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
          <h1 className="text-2xl font-bold">No certificate yet</h1>
          <p className="mt-2 text-muted-foreground">Pass the Python Beginner Exam with 80%+ to earn your certificate.</p>
          <Link to="/exam" className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">Take the Exam →</Link>
        </div>
      </Shell>
    );
  }

  // Generate a deterministic certificate ID from user id + exam date
  const certId = `QB-PY-${new Date(exam.taken_at).getFullYear()}-${user.id.slice(0, 5).toUpperCase()}`;

  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <Link to="/profile" className="text-muted-foreground">← Back to profile</Link>
        <div
          id="certificate"
          className="relative mt-4 overflow-hidden rounded-xl border-4 border-double border-gold p-10 text-center"
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
          <p className="mt-2 font-serif text-3xl text-gold">Python — Beginner Level</p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-left">
            <div>
              <p className="eyebrow text-muted-foreground">Final score</p>
              <p className="text-3xl font-bold text-primary">{exam.score}%</p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{new Date(exam.taken_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Certificate ID</p>
              <p className="text-lg font-bold">{certId}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
          >
            <Download className="h-4 w-4" />Download PDF
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast("Link copied!");
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 font-semibold"
          >
            <Share2 className="h-4 w-4" />Share Certificate
          </button>
        </div>
      </div>
    </Shell>
  );
}
