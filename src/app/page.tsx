import Link from "next/link";
import {
  Zap,
  GitBranch,
  Braces,
  Shield,
  Database,
  Bot,
  ShieldAlert,
  Minimize2,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Layers,
  Award,
  Code,
  UserCheck,
  CheckSquare,
  Cpu,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { getChallenges, getCategories } from "@/lib/queries";

const iconMap: Record<string, LucideIcon> = {
  Award,
  Zap,
  GitBranch,
  Braces,
  Shield,
  Database,
  Bot,
  ShieldAlert,
  Minimize2,
  MessageSquare,
  Layers,
  Code,
  UserCheck,
  CheckSquare,
};

const steps = [
  {
    number: "01",
    title: "Draft Prompt Templates",
    description:
      "Craft deterministic prompt architectures with variables, system constraints, and strict output boundaries.",
    icon: Code,
  },
  {
    number: "02",
    title: "Parallel Multi-Model Testing",
    description:
      "Simultaneously dispatch to Meta Llama 3.3 70B and Google Gemini 2.0 Flash to observe token variance and latency drift.",
    icon: Cpu,
  },
  {
    number: "03",
    title: "Automated Rubric Scorecards",
    description:
      "Rigorous judge engines score RFC schema compliance, token budgets, safety guardrails, and reasoning fidelity.",
    icon: BarChart3,
  },
];

const features = [
  {
    tag: "DETERMINISTIC EVALUATION",
    title: "Multi-Criteria Rubric Scoring",
    description:
      "Zero vibes-based grading. Submissions are scored against strict schema parsing, token budgets, and edge-case reasoning.",
  },
  {
    tag: "CROSS-MODEL BENCHMARK",
    title: "Foundation Model Verification",
    description:
      "Test against Meta Llama 3.3 70B and Google Gemini 2.0 Flash in real-time. Catch vendor-specific regressions before production.",
  },
  {
    tag: "PORTFOLIO METRICS",
    title: "Verifiable Engineering Portfolio",
    description:
      "Build a verifiable record of solved specifications, benchmark percentiles, and streak consistency for engineering teams.",
  },
];

export default async function HomePage() {
  const [challenges, categories] = await Promise.all([
    getChallenges(),
    getCategories(),
  ]);

  return (
    <div className="relative bg-[#0F172A] text-slate-50">
      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="hero-glow relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 border-b border-white/[0.08]">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Emerald Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-8">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>PromptSesh 2.0 // Dual Foundation LLMs Active</span>
            </div>

            {/* Heading with accent-gradient */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.12] mb-6">
              Master{" "}
              <span className="accent-gradient">Prompt Engineering</span>{" "}
              with Empirical Precision.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              The modern practice workbench for LLM engineers. Solve
              deterministic challenges, test across Llama 3.3 70B &amp; Gemini
              2.0 Flash, and inspect rubric scorecards.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link
                href="/challenges"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-5 py-2.5 text-xs font-bold cursor-pointer transition-all duration-200"
              >
                Explore Challenges
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/interview-simulator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#192134] border border-white/[0.08] text-white hover:border-emerald-500/40 px-5 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-200"
              >
                Technical Interview Simulator
              </Link>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto rounded-lg border border-white/[0.08] bg-[#192134] p-3">
              <div className="text-center border-r border-white/[0.08] pr-2">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {challenges.length}+
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  CHALLENGES
                </div>
              </div>
              <div className="text-center border-r border-white/[0.08] px-2">
                <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                  {categories.length}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  TRACKS
                </div>
              </div>
              <div className="text-center pl-2">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">
                  2 FREE
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  MODELS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specimen Box ───────────────────────────────────── */}
      <section className="relative -mt-10 z-10 pb-16 border-b border-white/[0.08]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-white/[0.08] bg-[#192134] p-5 sm:p-6 shadow-2xl">
            {/* Specimen Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08] text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <span className="text-emerald-400 font-semibold">&gt;</span>
                <span>specimen // invoice_parser_spec.ts</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                  Score: 100/100
                </span>
                <span className="text-slate-500 text-[10px] hidden sm:inline">
                  142ms // Gemini 2.0 Flash
                </span>
              </div>
            </div>

            {/* Specimen Body */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-50 font-mono">
              <div className="bg-[#0B1120] p-3 rounded-md border border-white/[0.08]">
                <span className="text-emerald-400 font-medium">
                  SYSTEM &gt;
                </span>{" "}
                You are a production data parser. Extract transactions strictly
                adhering to RFC-8259 JSON format with zero conversational filler.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-sans">
                <div className="rounded-md border border-white/[0.08] bg-[#0F172A] p-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Schema Compliance
                  </div>
                  <div className="font-bold text-sm text-white mt-0.5">
                    100% Valid
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Strict RFC parser confirmed
                  </div>
                </div>
                <div className="rounded-md border border-white/[0.08] bg-[#0F172A] p-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Boundary Defense
                  </div>
                  <div className="font-bold text-sm text-white mt-0.5">
                    100% Invariance
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Zero injection leakage
                  </div>
                </div>
                <div className="rounded-md border border-emerald-500/40 bg-[#0F172A] p-3">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                    Token Efficiency
                  </div>
                  <div className="font-bold text-sm text-emerald-400 mt-0.5">
                    96% Optimal
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    240 token budget
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skill Categories Grid ──────────────────────────── */}
      <section className="py-16 border-b border-white/[0.08] bg-[#0F172A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/[0.08] gap-2">
            <div>
              <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                CURRICULUM
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Skill Tracks &amp; Disciplines
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Structured engineering tracks categorized by production
              requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat: any) => {
              const Icon = iconMap[cat.icon] || Zap;
              return (
                <Link
                  key={cat.id}
                  href={`/challenges?category=${cat.slug}`}
                  className="p-4 rounded-lg border border-white/[0.08] bg-[#192134] hover:bg-[#243044] hover:border-white/[0.14] transition-all duration-200 group block cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-[#0F172A] text-emerald-400 group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-colors duration-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400 truncate transition-colors duration-200">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-400 border border-white/[0.08] bg-[#0F172A] px-1.5 py-0.5 rounded shrink-0 font-mono">
                          {cat.challengeCount} Labs
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                        {cat.description}
                      </p>
                      <div className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                        Explore Track
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Workflow Steps ──────────────────────────────────── */}
      <section className="py-16 border-b border-white/[0.08] bg-[#1E293B]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              PIPELINE
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Evaluation Methodology
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="p-5 rounded-lg border border-white/[0.08] bg-[#192134]"
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2 text-xs">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    STAGE {step.number}
                  </span>
                  <step.icon className="h-4 w-4 text-slate-400" />
                </div>
                <h3 className="text-xs font-bold text-white mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="py-16 border-b border-white/[0.08] bg-[#0F172A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              ARCHITECTURE
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Built for Engineering Rigor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-lg border border-white/[0.08] bg-[#192134]"
              >
                <div className="text-[10px] font-mono font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                  {feature.tag}
                </div>
                <h3 className="text-xs font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────── */}
      <section className="py-16 bg-[#0F172A]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-lg border border-emerald-500/40 bg-[#192134] p-8 sm:p-10">
            <div className="text-[11px] font-mono font-bold text-emerald-400 mb-2 uppercase tracking-wider">
              [BENCHMARK COMMISSION]
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Ready to verify your prompt engineering skills?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
              Start practicing now with Level 1 challenges and advance through
              expert multi-model reasoning and jailbreak defense.
            </p>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-2.5 text-xs font-bold cursor-pointer transition-all duration-200"
            >
              Start Practicing
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
