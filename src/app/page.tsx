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
    title: "1. PROMPT SPECIFICATION",
    description:
      "Formulate deterministic prompt architectures with strict input assertions and schema boundaries.",
    icon: Code,
  },
  {
    number: "02",
    title: "2. DUAL-ENGINE TESTING",
    description:
      "Simultaneously execute across Meta Llama 3.3 70B and Google Gemini 2.0 Flash to detect latency and variance.",
    icon: Cpu,
  },
  {
    number: "03",
    title: "3. AUTOMATED RUBRICS",
    description:
      "Structured judge models score submissions against deterministic criteria with exact numeric telemetry.",
    icon: BarChart3,
  },
];

const features = [
  {
    tag: "[01. RUBRICS]",
    title: "MULTI-FACTOR EVALUATION",
    description:
      "Zero vibes-based grading. Submissions are scored on structured RFC schema compliance, token limits, and safety invariants.",
  },
  {
    tag: "[02. COMPATIBILITY]",
    title: "CROSS-MODEL CALIBRATION",
    description:
      "Parallel verification against Meta Llama 3.3 70B and Google Gemini 2.0 Flash to eliminate vendor lock-in.",
  },
  {
    tag: "[03. PORTFOLIO]",
    title: "VERIFIED BENCHMARKS",
    description:
      "Curate verifiable submission records, benchmark percentiles, and streak records for engineering evaluation.",
  },
];

export default async function HomePage() {
  const [challenges, categories] = await Promise.all([
    getChallenges(),
    getCategories(),
  ]);

  return (
    <div className="relative bg-[#000000] text-white">
      {/* ── Hero Section (Stark Swiss) ───────────────────── */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 border-b border-[#27272a] grid-bg">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Swiss System Stamp */}
            <div className="inline-block border border-white bg-black px-3 py-1 text-[11px] font-mono font-bold tracking-widest text-white uppercase mb-8">
              PROMPTSESH // SWISS BENCHMARK SPECIFICATION
            </div>

            {/* Stark Uppercase Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none uppercase mb-6">
              THE EMPIRICAL BENCHMARK <br />
              <span className="text-zinc-400">FOR PROMPT ENGINEERING</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-mono">
              Deterministic challenge environments for language model practitioners. Test across open foundation models, inspect weighted rubric breakdowns, and develop rigorous AI engineering competence.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 font-mono">
              <Link
                href="/challenges"
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-zinc-200 text-black border border-white font-black text-xs uppercase tracking-wider transition-all"
              >
                OPEN CHALLENGE CATALOGUE &rarr;
              </Link>
              <Link
                href="/interview-simulator"
                className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-zinc-900 text-white border border-zinc-700 hover:border-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                INTERVIEW SIMULATOR
              </Link>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-0 max-w-lg mx-auto border border-[#27272a] bg-[#0a0a0a] text-center font-mono">
              <div className="p-3 border-r border-[#27272a]">
                <div className="text-xl sm:text-2xl font-black text-white">{challenges.length}+</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">LABS</div>
              </div>
              <div className="p-3 border-r border-[#27272a]">
                <div className="text-xl sm:text-2xl font-black text-white">{categories.length}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">TRACKS</div>
              </div>
              <div className="p-3">
                <div className="text-xl sm:text-2xl font-black text-white">2 FREE</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">MODELS</div>
              </div>
            </div>
          </div>

          {/* Swiss Specimen Box */}
          <div className="mt-14 mx-auto max-w-4xl border border-[#27272a] bg-[#0a0a0a] p-6 shadow-sm font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27272a] text-xs">
              <div className="flex items-center gap-2">
                <span className="bg-white text-black px-1.5 py-0.2 font-black text-[10px]">TEST</span>
                <span className="text-white font-bold">SPECIMEN // INVOICE_SCHEMA_PARSER</span>
              </div>
              <span className="border border-white bg-white text-black px-2 py-0.5 text-[10px] font-black">
                SCORE: 100/100 [PASS]
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
              <div className="bg-black p-3 border border-zinc-800 text-[12px]">
                <span className="text-white font-bold">SYSTEM_PROMPT &gt;</span> You are an authoritative data validation engine. Extract transactions strictly adhering to RFC-8259 JSON format without conversational commentary.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
                <div className="border border-zinc-800 bg-black p-3">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">SCHEMA VALIDITY</div>
                  <div className="text-sm font-black text-white mt-1">100% VALID</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">RFC-8259 confirmed</div>
                </div>
                <div className="border border-zinc-800 bg-black p-3">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">BOUNDARY INVARIANCE</div>
                  <div className="text-sm font-black text-white mt-1">100% SECURE</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Zero injection leakage</div>
                </div>
                <div className="border border-white bg-black p-3">
                  <div className="text-[10px] text-white uppercase font-bold">TOKEN EFFICIENCY</div>
                  <div className="text-sm font-black text-white mt-1">96% OPTIMAL</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Under 220 output tokens</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skill Categories Grid ────────────────────────── */}
      <section className="py-16 border-b border-[#27272a] bg-[#050505]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#27272a] gap-2">
            <div>
              <div className="text-[11px] font-mono font-bold text-white uppercase tracking-wider mb-1">
                // CURRICULUM_INDEX
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase">
                Skill Tracks & Disciplines
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm font-mono">
              Deterministic curricula organized by architectural specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat: any, idx: number) => {
              const Icon = iconMap[cat.icon] || Zap;
              return (
                <Link
                  key={cat.id}
                  href={`/challenges?category=${cat.slug}`}
                  className="p-4 border border-[#27272a] bg-[#0a0a0a] hover:border-white hover:bg-[#121212] transition-all group block font-mono"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-800 bg-black text-white group-hover:border-white">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white group-hover:underline truncate uppercase">
                          [{String(idx + 1).padStart(2, "0")}] {cat.name}
                        </span>
                        <span className="text-[10px] text-black bg-white font-black px-1 shrink-0">
                          {cat.challengeCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-2 font-sans">
                        {cat.description}
                      </p>
                      <div className="text-[10px] font-bold text-white flex items-center gap-1">
                        EXECUTE_TRACK &rarr;
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
      <section className="py-16 border-b border-[#27272a] bg-[#000000]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">
              // METHODOLOGY
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase">
              Evaluation Procedure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {steps.map((step) => (
              <div
                key={step.number}
                className="p-5 border border-[#27272a] bg-[#0a0a0a]"
              >
                <div className="flex items-center justify-between mb-3 border-b border-[#27272a] pb-2 text-xs">
                  <span className="font-bold text-white">PHASE_{step.number}</span>
                  <step.icon className="h-4 w-4 text-zinc-500" />
                </div>
                <h3 className="text-xs font-black text-white mb-2 uppercase">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-16 border-b border-[#27272a] bg-[#050505]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">
              // ARCHITECTURE
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase">
              System Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-5 border border-[#27272a] bg-[#0a0a0a]"
              >
                <div className="text-[10px] font-bold text-zinc-400 mb-2">{feature.tag}</div>
                <h3 className="text-xs font-black text-white mb-2 uppercase">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Callout ──────────────────────────────── */}
      <section className="py-16 bg-[#000000]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center font-mono">
          <div className="border border-white bg-[#0a0a0a] p-8 sm:p-10">
            <div className="text-[11px] font-bold text-zinc-400 mb-2">[BENCHMARK COMMISSION]</div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-3 uppercase">
              INITIALIZE EMPIRICAL PRACTICE
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed font-sans">
              Access 100+ prompt engineering labs graded on strict academic rubrics with free open models.
            </p>
            <Link
              href="/challenges"
              className="inline-block px-8 py-3 bg-white hover:bg-zinc-200 text-black border border-white font-black text-xs uppercase tracking-wider transition-all"
            >
              INITIALIZE_CURRICULUM &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
