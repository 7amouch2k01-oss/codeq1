import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Shell } from "@/components/site";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Questbound" },
      {
        name: "description",
        content: "Free Explorer, Pro Adventurer at $9/month, or Lifetime Legend for $149.",
      },
      { property: "og:title", content: "Unlock your full quest — Questbound pricing" },
      { property: "og:description", content: "Choose the path that fits your adventure." },
    ],
  }),
  component: Pricing,
});

const faqs = [
  ["Can I switch plans later?", "Yes, upgrade or downgrade anytime from your profile."],
  ["Do you offer a refund?", "Yes — contact us within 14 days for a full refund."],
  ["Will I keep my progress if I upgrade?", "Absolutely. All XP, badges and progress carry over."],
  [
    "Are the certificates recognized?",
    "Certificates verify your completed exams and can be shared on your profile or LinkedIn.",
  ],
];

function Pricing() {
  const [yearly, setYearly] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    if (!user) {
      toast("Please sign in or create an account first.");
      navigate({ to: "/auth" });
      return;
    }

    if (planName === "Free Explorer") {
      toast.success("You are on the Free Explorer plan!");
      navigate({ to: "/courses" });
      return;
    }

    // Direct user to Stripe / Checkout when configured, or confirm intent
    toast.info(`${planName} checkout will be connected to your Stripe account upon deployment!`);
  };

  const plans = [
    {
      n: "Free Explorer",
      s: "Start your coding journey",
      p: "$0",
      u: "/ month",
      f: [
        "Access to beginner levels",
        "Limited AI hints (10 per day)",
        "Community access",
        "Track your progress",
      ],
      no: ["Exams and certificates"],
      cta: user ? "Current Plan" : "Get Started Free",
    },
    {
      n: "Pro Adventurer",
      s: "Go further. Learn faster.",
      p: yearly ? "$90" : "$9",
      u: yearly ? "/ year" : "/ month",
      f: [
        "Access to all levels and paths",
        "Unlimited AI tutor and hints",
        "Exams and certificates",
        "Daily coding battles",
        "Priority support",
      ],
      cta: "Start Pro Today",
      hot: true,
    },
    {
      n: "Lifetime Legend",
      s: "A one-time quest for a lifetime",
      p: "$149",
      u: "one-time",
      f: [
        "Lifetime access to all content",
        "Unlimited AI tutor and hints",
        "Exams and certificates",
        "Daily coding battles",
        "Founding legend badge",
      ],
      cta: "Claim Lifetime Access",
      gold: true,
    },
  ];

  return (
    <Shell>
      <div className="text-center">
        <p className="eyebrow text-muted-foreground">Invest in a brighter you</p>
        <h1 className="mt-3 text-5xl font-bold">
          Unlock your <span className="text-primary">full quest</span>
        </h1>
        <div className="mt-6 inline-flex rounded-full border border-border p-1">
          {["Monthly", "Yearly"].map((t) => (
            <button
              key={t}
              onClick={() => setYearly(t === "Yearly")}
              className={`rounded-full px-6 py-2 ${yearly === (t === "Yearly") ? "bg-primary text-primary-foreground" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-primary">Save 17% with yearly</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.n}
            className={`panel flex flex-col p-6 ${p.hot ? "border-primary glow" : p.gold ? "border-gold" : ""}`}
          >
            {p.hot && <span className="eyebrow mb-2 text-primary">Most popular</span>}
            <h2 className="text-2xl font-bold">{p.n}</h2>
            <p className="text-muted-foreground">{p.s}</p>
            <p className="my-5">
              <span className="font-display text-5xl font-bold">{p.p}</span>{" "}
              <span className="text-muted-foreground">{p.u}</span>
            </p>
            <ul className="flex-1 space-y-2">
              {p.f.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className={`h-5 w-5 ${p.gold ? "text-gold" : "text-primary"}`} />
                  {f}
                </li>
              ))}
              {p.no?.map((f) => (
                <li key={f} className="flex gap-2 text-muted-foreground">
                  <X className="h-5 w-5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectPlan(p.n)}
              className={`mt-6 rounded-xl py-3 font-semibold transition ${
                p.hot
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : p.gold
                    ? "border border-gold text-gold hover:bg-gold/10"
                    : "border border-border hover:bg-muted"
              }`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <h2 className="text-center text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="panel p-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </Shell>
  );
}
