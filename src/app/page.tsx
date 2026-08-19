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
  Command,
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
      "Construct deterministic prompt architectures with variables, input constraints, few-shot examples, and strict output boundaries.",
    icon: Code,
  },
  {
    number: "02",
    title: "Parallel Multi-Model Execution",
    description:
      "Simultaneously dispatch to Meta Llama 3.3 70B and Google Gemini 2.0 Flash to observe variance, latency, and token drift.",
    icon: Cpu,
  },
  {
    number: "03",
    title: "Review Rubric Scorecards",
    description:
      "Automated evaluation engines inspect RFC schema compliance, token budgets, boundary invariants, and reasoning depth.",
    icon: BarChart3,
  },
];

const features = [
  {
    tag: "OBJECTIVE EVALUATION",
    title: "Multi-Factor Rubric Scoring",
    description:
      "Zero vibes-based grading. Submissions are scored against strict schema parsing, token budgets, edge reasoning, and safety guardrails.",
  },
  {
    tag: "CROSS-MODEL BENCHMARK",
    title: "Foundation Model Calibration",
    description:
      "Test against Meta Llama 3.3 70B and Google Gemini 2.0 Flash in real-time. Catch vendor-specific regressions before production.",
  },
  {
    tag: "VERIFIED SIGNALS",
    title: "Engineering Portfolio Records",
    description:
      "Curate verifiable submission histories, benchmark percentiles, and streak metrics calibrated for senior AI engineering teams.",
  },
];

export default async function HomePage() {
  const [challenges, categories] = await Promise.all([
    getChallenges(),
    getCategories(),
  ]);

  return (
    <div className="relative bg-[#09090b] text-zinc-100">
      {/* ── Hero Section (Obsidian Stealth) ───────────────── */}
      <section className="relative overflow-hidden stealth-glow-bg pt-20 pb-24 sm:pt-28 sm:pb-32 border-b border-white/[0.08]">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Raycast Style Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#141417] px-3.5 py-1 text-xs font-medium text-zinc-300 mb-8 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
              <span>PromptSesh 2.0 // Dual Foundation LLMs Active</span>
            </div>

            {/* Titanium Gradient Headline */}
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.12] mb-6">
              Master <span className="titanium-gradient">Prompt Engineering</span> with Empirical Precision.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
              A high-craft workbench for LLM engineers. Solve deterministic challenges, test across Llama 3.3 70B & Gemini 2.0 Flash, and inspect criterion-level rubric scorecards.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link
                href="/challenges"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#f4f4f5] hover:bg-white text-[#09090b] px-5 py-2.5 text-xs font-semibold shadow-xs transition-all"
              >
                Explore Challenges
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/interview-simulator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#18181c] hover:bg-[#202026] text-zinc-200 border border-white/[0.08] hover:border-white/[0.16] px-5 py-2.5 text-xs font-medium transition-all"
              >
                Technical Interview Simulator
              </Link>
            </div>

            {/* Stats Elevation Strip */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto rounded-lg border border-white/[0.08] bg-[#121215] p-3 shadow-xs">
              <div className="text-center border-r border-white/[0.08] pr-2">
                <div className="text-xl sm:text-2xl font-semibold text-zinc-100">{challenges.length}+</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">CHALLENGES</div>
              </div>
              <div className="text-center border-r border-white/[0.08] px-2">
                <div className="text-xl sm:text-2xl font-semibold text-indigo-400">{categories.length}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">TRACKS</div>
              </div>
              <div className="text-center pl-2">
                <div className="text-xl sm:text-2xl font-semibold text-zinc-300">2 FREE</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">MODELS</div>
              </div>
            </div>
          </div>

          {/* Raycast Telemetry Specimen Box */}
          <div className="mt-14 mx-auto max-w-4xl rounded-lg border border-white/[0.1] bg-[#121215] p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08] text-xs">
              <div className="flex items-center gap-2 text-zinc-400 font-mono">
                <span className="text-indigo-400 font-semibold">&gt;</span>
                <span>specimen // invoice_parser_spec.ts</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 text-[10px] font-medium">
                  Score: 100/100
                </span>
                <span className="text-zinc-500 text-[10px] hidden sm:inline">
                  142ms // Gemini 2.0 Flash
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-zinc-300 font-mono">
              <div className="bg-[#09090b] p-3 rounded-md border border-white/[0.06]">
                <span className="text-indigo-400 font-medium">SYSTEM &gt;</span> You are a production data parser. Extract transactions strictly adhering to RFC-8259 JSON format with zero conversational filler.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-sans">
                <div className="rounded-md border border-white/[0.08] bg-[#18181c] p-3">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase font-medium">Schema Compliance</div>
                  <div className="font-semibold text-sm text-zinc-100 mt-0.5">100% Valid</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Strict RFC parser confirmed</div>
                </div>
                <div className="rounded-md border border-white/[0.08] bg-[#18181c] p-3">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase font-medium">Boundary Defense</div>
                  <div className="font-semibold text-sm text-zinc-100 mt-0.5">100% Invariance</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Zero injection leakage</div>
                </div>
                <div className="rounded-md border border-indigo-500/25 bg-[#18181c] p-3">
                  <div className="text-[10px] font-mono text-indigo-400 uppercase font-medium">Token Efficiency</div>
                  <div className="font-semibold text-sm text-indigo-300 mt-0.5">96% Optimal</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">240 token budget</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skill Categories Grid ────────────────────────── */}
      <section className="py-16 border-b border-white/[0.08] bg-[#09090b]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/[0.08] gap-2">
            <div>
              <div className="text-[11px] font-mono font-medium text-indigo-400 uppercase tracking-wider mb-1">
                CURRICULUM
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100">
                Skill Tracks & Disciplines
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm">
              Structured engineering tracks categorized by production requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat: any, idx: number) => {
              const Icon = iconMap[cat.icon] || Zap;
              return (
                <Link
                  key={cat.id}
                  href={`/challenges?category=${cat.slug}`}
                  className="p-4 rounded-lg border border-white/[0.08] bg-[#121215] hover:bg-[#18181c] hover:border-white/[0.16] transition-all group block shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-[#18181c] text-zinc-300 group-hover:border-indigo-500/40 group-hover:text-indigo-400 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 border border-white/[0.08] bg-[#18181c] px-1.5 py-0.2 rounded shrink-0 font-mono">
                          {cat.challengeCount} Labs
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-2">
                        {cat.description}
                      </p>
                      <div className="text-[10px] font-medium text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Explore Track &rarr;
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Workflow Steps ──────────────────────────────── */}
      <section className="py-16 border-b border-white/[0.08] bg-[#0c0c0e]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono font-medium text-indigo-400 uppercase tracking-wider mb-1">
              PIPELINE
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100">
              Evaluation Methodology
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="p-5 rounded-lg border border-white/[0.08] bg-[#121215] shadow-xs"
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2 text-xs">
                  <span className="font-mono text-xs font-medium text-indigo-400">STAGE {step.number}</span>
                  <step.icon className="h-4 w-4 text-zinc-500" />
                </div>
                <h3 className="text-xs font-semibold text-zinc-100 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-16 border-b border-white/[0.08] bg-[#09090b]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono font-medium text-indigo-400 uppercase tracking-wider mb-1">
              ARCHITECTURE
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100">
              Built for Engineering Rigor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-lg border border-white/[0.08] bg-[#121215] shadow-xs"
              >
                <div className="text-[10px] font-mono font-medium text-indigo-400 mb-2">{feature.tag}</div>
                <h3 className="text-xs font-semibold text-zinc-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Callout ──────────────────────────────── */}
      <section className="py-16 bg-[#09090b]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-lg border border-white/[0.1] bg-[#121215] p-8 sm:p-10 shadow-xl">
            <div className="text-[11px] font-mono font-medium text-indigo-400 mb-2">[BENCHMARK COMMISSION]</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 mb-3">
              Ready to verify your prompt engineering skills?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
              Start practicing now with Level 1 challenges and advance through expert multi-model reasoning and jailbreak defense.
            </p>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-md bg-[#f4f4f5] hover:bg-white text-[#09090b] px-6 py-2.5 text-xs font-semibold shadow-xs transition-all"
            >
              Start Practicing &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
