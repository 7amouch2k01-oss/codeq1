import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/site";
import logo from "@/assets/logo.png";
import mountains from "@/assets/bg-mountains.jpg";

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
  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <Link to="/profile" className="text-muted-foreground">← Back to profile</Link>
        <div className="relative mt-4 overflow-hidden rounded-xl border-4 border-double border-gold p-10 text-center">
          <img src={mountains} alt="" width={1920} height={640} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />
          <img src={logo} alt="" width={64} height={64} className="mx-auto h-16 w-16" />
          <p className="eyebrow mt-2 text-gold">Questbound Code Academy</p>
          <h1 className="mt-6 font-serif text-5xl text-gold">Certificate of Completion</h1>
          <p className="eyebrow mt-6">This certifies that</p>
          <p className="mt-2 text-4xl font-bold">Alex Martin</p>
          <p className="eyebrow mt-6 text-gold">Has successfully completed</p>
          <p className="mt-2 font-serif text-3xl text-gold">Python — Beginner Level</p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-left">
            <div><p className="eyebrow text-muted-foreground">Final score</p><p className="text-3xl font-bold text-primary">92%</p></div>
            <div><p className="eyebrow text-muted-foreground">Completed</p><p className="text-lg font-bold">Oct 26, 2026</p></div>
            <div><p className="eyebrow text-muted-foreground">Certificate ID</p><p className="text-lg font-bold">QB-PY-2026-78142</p></div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground"><Download className="h-4 w-4" />Download PDF</button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast("Link copied!"); }} className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 font-semibold"><Share2 className="h-4 w-4" />Share Certificate</button>
        </div>
      </div>
    </Shell>
  );
}
