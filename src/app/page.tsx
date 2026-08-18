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
  Sparkles,
  BarChart3,
  Layers,
  Award,
  Code,
  UserCheck,
  CheckSquare,
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
    title: "Write Your Prompt",
    description:
      "Tackle real-world prompt engineering challenges. Craft your solution in our editor with syntax highlighting and variable support.",
    icon: Sparkles,
    color: "#22d3ee",
  },
  {
    number: "02",
    title: "AI Grades It",
    description:
      "Your prompt is tested against multiple LLMs. An AI judge scores it on a structured rubric — not vibes, real criteria.",
    icon: BarChart3,
    color: "#a78bfa",
  },
  {
    number: "03",
    title: "Level Up",
    description:
      "See per-criterion breakdowns, cross-model comparisons, and track your progress with streaks and badges.",
    icon: Layers,
    color: "#34d399",
  },
];

const features = [
  {
    title: "Rubric-Based Grading",
    description:
      "Every challenge has a structured rubric with weighted criteria. Get scored on each dimension — not just a vague pass/fail.",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    title: "Cross-Model Testing",
    description:
      "Run your prompt against Claude, GPT-4o, and Gemini. See where your prompt generalizes and where it's model-specific.",
    icon: Layers,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Score History & Streaks",
    description:
      "Track your improvement over time. Build daily streaks, earn badges, and share your profile as hiring signal.",
    icon: BarChart3,
    gradient: "from-amber-500 to-orange-500",
  },
];

export default async function HomePage() {
  const [challenges, categories] = await Promise.all([
    getChallenges(),
    getCategories(),
  ]);
  return (
    <div className="relative">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-slate-400 mb-8 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Now in Public Beta — Start practicing for free
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              <span className="text-white">Master </span>
              <span className="gradient-text">Prompt Engineering</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Solve challenges. Get AI-graded feedback on a structured rubric.
              Test across multiple LLMs. Prove your skills — like LeetCode, but
              for the age of AI.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/challenges"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110"
              >
                Start Practicing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/challenges"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-8 py-3.5 text-base font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white backdrop-blur-sm"
              >
                Browse Challenges
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-16">
              {[
                { label: "Prompt Challenges", value: `${challenges.length}+` },
                { label: "Skill Categories", value: `${categories.length}` },
                { label: "Rubric Evals", value: "Multi-Model" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            {/* Terminal Showcase Card */}
            <div className="mt-16 mx-auto max-w-4xl text-left glass-card p-6 sm:p-8 relative overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 glow-cyan animate-float">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400">workspace / prompt_engineering.ps</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Passed 100%
                  </span>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-md">
                    Gemini 2.5 Flash
                  </span>
                </div>
              </div>

              {/* Terminal Code Snippet */}
              <div className="font-mono text-xs sm:text-sm space-y-2 leading-relaxed text-slate-300">
                <div className="text-purple-400 font-semibold">// Task: Zero-Shot Structured JSON Extractor</div>
                <div className="text-slate-400">
                  <span className="text-cyan-400">SYSTEM:</span> You are a production data parser. You MUST output strict RFC-8259 compliant JSON with zero markdown or conversational filler.
                </div>
                <div className="bg-dark-900/80 p-3 rounded-lg border border-white/[0.06] text-emerald-300">
                  <span className="text-slate-500">// Rubric Evaluation Output</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[11px]">JSON Schema Compliance: 100%</span>
                    <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[11px]">Zero-Shot Accuracy: 98%</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[11px]">Latency: 312ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Grid ──────────────────────────────── */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {categories.length} Skill Categories
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Organized by real prompt engineering skills — not just difficulty.
              Master each domain to become a complete practitioner.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat: any) => {
              const Icon = iconMap[cat.icon] || Zap;
              return (
                <Link
                  key={cat.id}
                  href={`/challenges?category=${cat.slug}`}
                  className="glass-card-hover p-5 sm:p-6 group relative rounded-2xl border border-white/[0.06] bg-dark-900/60 hover:bg-dark-900 transition-all shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] shadow-inner"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {cat.name}
                        </h3>
                        <span
                          className="text-[10px] font-bold font-mono shrink-0 px-2 py-0.5 rounded-full border"
                          style={{
                            color: cat.color,
                            borderColor: `${cat.color}30`,
                            backgroundColor: `${cat.color}10`,
                          }}
                        >
                          {cat.challengeCount} Labs
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                        {cat.description}
                      </p>
                      <span
                        className="text-xs font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                        style={{ color: cat.color }}
                      >
                        Explore Labs →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-800/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Three steps to level up your prompt engineering skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="glass-card-hover p-6 text-center">
                {/* Step Number */}
                <div
                  className="text-6xl font-black mb-6"
                  style={{ color: `${step.color}20` }}
                >
                  {step.number}
                </div>
                {/* Icon */}
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5 shadow-lg"
                  style={{
                    backgroundColor: `${step.color}15`,
                    color: step.color,
                  }}
                >
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built Different
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Not just another AI playground. PromptSesh has real grading, real
              rubrics, and real career signal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card-hover p-8 relative overflow-hidden group"
              >
                {/* Gradient glow */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="gradient-border p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to level up?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                Start mastering prompt engineering today. Begin
                with Easy challenges and work your way to Expert.
              </p>
              <Link
                href="/challenges"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110"
              >
                Start Practicing Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
