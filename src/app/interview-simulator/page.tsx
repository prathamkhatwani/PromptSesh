"use client";

import { useState, useRef, useEffect } from "react";
import {
  Building2,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  Shield,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Brain,
  Zap,
  TrendingUp,
} from "lucide-react";

/* ── Types ─────────────────────────────────── */

interface CompanyOption {
  id: string;
  name: string;
  logo: string;
  color: string;
  gradient: string;
  tagline: string;
}

interface InterviewPhase {
  type: "selection" | "scenario" | "prompting" | "followup" | "answering-followup" | "verdict";
}

interface ChatMessage {
  id: string;
  role: "interviewer" | "candidate" | "system";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ScoreEntry {
  score: number;
  feedback: string;
}

interface FinalScorecard {
  technicalDepth: ScoreEntry;
  edgeCaseHandling: ScoreEntry;
  communicationClarity: ScoreEntry;
  architecturalDesign: ScoreEntry;
  overallScore: number;
  verdict: string;
  verdictReasoning: string;
  improvementAreas: string[];
}

/* ── Companies ─────────────────────────────── */

const COMPANIES: CompanyOption[] = [
  { id: "openai", name: "OpenAI", logo: "🤖", color: "emerald", gradient: "from-emerald-500 to-teal-600", tagline: "AI Safety & Alignment" },
  { id: "anthropic", name: "Anthropic", logo: "🛡️", color: "orange", gradient: "from-orange-500 to-amber-600", tagline: "Constitutional AI" },
  { id: "google", name: "Google", logo: "🔍", color: "blue", gradient: "from-blue-500 to-indigo-600", tagline: "Multimodal AI & RAG" },
  { id: "meta", name: "Meta", logo: "Ⓜ️", color: "sky", gradient: "from-sky-500 to-blue-600", tagline: "Open-Source LLM Safety" },
  { id: "stripe", name: "Stripe", logo: "💳", color: "purple", gradient: "from-purple-500 to-violet-600", tagline: "Financial AI Systems" },
  { id: "scale-ai", name: "Scale AI", logo: "🏷️", color: "pink", gradient: "from-pink-500 to-rose-600", tagline: "Data Quality & Taxonomy" },
];

const DIFFICULTIES = ["Medium", "Hard", "Expert"];

/* ── Score Color ───────────────────────────── */

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "from-emerald-500 to-teal-500";
  if (score >= 65) return "from-amber-500 to-orange-500";
  return "from-red-500 to-rose-500";
}

function verdictConfig(verdict: string) {
  switch (verdict) {
    case "STRONG_HIRE":
      return { label: "Strong Hire", icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", emoji: "🎉" };
    case "LEAN_HIRE":
      return { label: "Lean Hire", icon: CheckCircle2, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", emoji: "✅" };
    case "LEAN_NO_HIRE":
      return { label: "Lean No Hire", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", emoji: "⚠️" };
    case "STRONG_NO_HIRE":
      return { label: "Strong No Hire", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", emoji: "❌" };
    default:
      return { label: verdict, icon: Target, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", emoji: "📋" };
  }
}

/* ── Main Component ────────────────────────── */

export default function InterviewSimulatorPage() {
  const [phase, setPhase] = useState<InterviewPhase>({ type: "selection" });
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Hard");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [followupAnswer, setFollowupAnswer] = useState("");

  // Data from API
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [scorecard, setScorecard] = useState<FinalScorecard | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  /* ── Add message helper ──────────────────── */
  const addMessage = (role: ChatMessage["role"], content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}-${Math.random()}`, role, content, timestamp: new Date() },
    ]);
  };

  /* ── API Calls ───────────────────────────── */

  const startInterview = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    setMessages([]);

    addMessage("system", `Starting ${selectedDifficulty}-level interview for ${selectedCompany.name}...`);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          company: selectedCompany.id,
          difficulty: selectedDifficulty,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setScenarioData(data.data);
        addMessage(
          "interviewer",
          `Welcome to your ${selectedCompany.name} technical interview. I'm the ${data.interviewer?.name || "Lead Engineer"} here.\n\nLet's jump right in.\n\n---\n\n**📋 Scenario:**\n${data.data.scenario}\n\n---\n\n**🔍 Additional Context:**\n${data.data.context}\n\n---\n\nPlease design your prompt solution below. Take your time — I'm looking for production-quality thinking.`
        );
        setPhase({ type: "prompting" });
      } else {
        addMessage("system", `Error: ${data.error || "Failed to start interview"}`);
      }
    } catch (err: any) {
      addMessage("system", `Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const submitPromptResponse = async () => {
    if (!promptText.trim() || promptText.trim().length < 10) return;
    setLoading(true);

    addMessage("candidate", promptText);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "respond",
          scenario: scenarioData?.scenario || "",
          candidateResponse: promptText,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setEvaluationData(data.data);
        const eval_ = data.data.evaluation;
        const followups = data.data.followupQuestions;

        addMessage(
          "interviewer",
          `Thanks for your response. Let me share my initial assessment:\n\n**✅ Strengths:**\n${eval_.strengths.map((s: string) => `• ${s}`).join("\n")}\n\n**⚠️ Areas for Improvement:**\n${eval_.weaknesses.map((w: string) => `• ${w}`).join("\n")}\n\n---\n\nNow, I have a follow-up question for you:\n\n**${followups[0]}**`
        );
        setPhase({ type: "answering-followup" });
        setPromptText("");
      } else {
        addMessage("system", `Error: ${data.error}`);
      }
    } catch (err: any) {
      addMessage("system", `Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const submitFollowup = async () => {
    if (!followupAnswer.trim() || followupAnswer.trim().length < 5) return;
    setLoading(true);

    addMessage("candidate", followupAnswer);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "followup",
          scenario: scenarioData?.scenario || "",
          candidateResponse: promptText || messages.find((m) => m.role === "candidate")?.content || "",
          followupQuestion: evaluationData?.followupQuestions?.[0] || "",
          candidateFollowup: followupAnswer,
        }),
      });
      const data = await res.json();

      if (data.success && data.data.finalScorecard) {
        setScorecard(data.data.finalScorecard);
        addMessage("interviewer", "Thank you for completing the interview. I've prepared your final scorecard.");
        setPhase({ type: "verdict" });
      } else {
        addMessage("system", `Error: ${data.error || "Failed to generate verdict"}`);
      }
    } catch (err: any) {
      addMessage("system", `Connection error: ${err.message}`);
    } finally {
      setLoading(false);
      setFollowupAnswer("");
    }
  };

  const resetInterview = () => {
    setPhase({ type: "selection" });
    setSelectedCompany(null);
    setMessages([]);
    setPromptText("");
    setFollowupAnswer("");
    setScenarioData(null);
    setEvaluationData(null);
    setScorecard(null);
    setLoading(false);
  };

  /* ── Render: Company Selection ───────────── */

  if (phase.type === "selection") {
    return (
      <div className="min-h-screen bg-dark-950">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-cyan-500/8 blur-[100px]" />
          <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-purple-500/8 blur-[100px]" />

          <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium text-cyan-400 mb-6">
              <Brain className="h-3.5 w-3.5" />
              AI-Powered Mock Interviews
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">Interview</span>{" "}
              <span className="text-white">Simulator</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
              Practice real prompt engineering interviews with an AI interviewer acting as a{" "}
              <strong className="text-white">Lead AI Architect</strong> at top companies.
              Get grilled, scored, and receive a hire/no-hire verdict.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 mb-12">
              <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-cyan-400" /> Multi-round conversation</span>
              <span className="flex items-center gap-1.5"><Target className="h-4 w-4 text-purple-400" /> Follow-up grilling</span>
              <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4 text-amber-400" /> Hire/No-Hire verdict</span>
            </div>
          </div>
        </div>

        {/* Company Selection */}
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-xl font-semibold text-white mb-2">Select a Company</h2>
          <p className="text-sm text-slate-500 mb-8">Choose where you want to interview. Each company tests different prompt engineering skills.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {COMPANIES.map((company) => (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(company)}
                className={`group relative text-left p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                  selectedCompany?.id === company.id
                    ? `border-white/20 bg-white/[0.06] shadow-lg`
                    : "border-white/[0.06] bg-dark-900 hover:border-white/[0.12] hover:bg-white/[0.03]"
                }`}
              >
                {selectedCompany?.id === company.id && (
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${company.gradient} opacity-[0.04]`} />
                )}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{company.logo}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{company.name}</h3>
                      <p className="text-xs text-slate-500">{company.tagline}</p>
                    </div>
                  </div>
                  {selectedCompany?.id === company.id && (
                    <div className="flex items-center gap-1 text-xs text-cyan-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Selected
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Difficulty Selector */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-2">Difficulty Level</h2>
            <p className="text-sm text-slate-500 mb-4">Higher difficulty means more complex scenarios and tougher follow-up questions.</p>
            <div className="flex gap-3">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-dark-800 text-slate-400 border border-white/[0.06] hover:border-white/[0.12] hover:text-slate-300"
                  }`}
                >
                  {diff === "Medium" && "⚡ "}
                  {diff === "Hard" && "🔥 "}
                  {diff === "Expert" && "💀 "}
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startInterview}
            disabled={!selectedCompany || loading}
            className={`group relative inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-base font-semibold shadow-lg transition-all duration-300 ${
              selectedCompany
                ? `bg-gradient-to-r ${selectedCompany.gradient} text-white shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110 cursor-pointer`
                : "bg-dark-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? "Preparing Interview..." : selectedCompany ? `Start ${selectedCompany.name} Interview` : "Select a Company to Begin"}
            {selectedCompany && !loading && (
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── Render: Interview Chat ──────────────── */

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-16 z-30 border-b border-white/[0.06] bg-dark-950/95 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={resetInterview}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              title="Back to selection"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-white/[0.08]" />
            <span className="text-lg">{selectedCompany?.logo}</span>
            <div>
              <h2 className="text-sm font-semibold text-white">{selectedCompany?.name} Interview</h2>
              <p className="text-xs text-slate-500">{selectedDifficulty} Difficulty • Live Session</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Phase indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              {["Scenario", "Your Solution", "Follow-Up", "Verdict"].map((step, i) => {
                const phaseOrder = { scenario: 0, prompting: 1, "answering-followup": 2, followup: 2, verdict: 3 };
                const currentIdx = phaseOrder[phase.type as keyof typeof phaseOrder] ?? 0;
                const isActive = i === currentIdx;
                const isDone = i < currentIdx;
                return (
                  <div key={step} className="flex items-center gap-1.5">
                    <div
                      className={`h-2 w-2 rounded-full transition-all ${
                        isDone ? "bg-emerald-400" : isActive ? "bg-cyan-400 animate-pulse" : "bg-dark-600"
                      }`}
                    />
                    <span className={`text-xs ${isActive ? "text-white font-medium" : isDone ? "text-slate-400" : "text-slate-600"}`}>
                      {step}
                    </span>
                    {i < 3 && <ChevronRight className="h-3 w-3 text-slate-700" />}
                  </div>
                );
              })}
            </div>

            <button
              onClick={resetInterview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-white/[0.06] text-xs text-slate-400 hover:text-white hover:border-white/[0.12] transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Restart
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "candidate" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                  msg.role === "interviewer"
                    ? `bg-gradient-to-br ${selectedCompany?.gradient || "from-cyan-500 to-blue-600"} text-white`
                    : msg.role === "candidate"
                    ? "bg-cyan-500/10 border border-cyan-500/25 text-cyan-400"
                    : "bg-dark-700 text-slate-500"
                }`}
              >
                {msg.role === "interviewer" ? (selectedCompany?.logo || "🎯") : msg.role === "candidate" ? "👤" : "⚙️"}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === "interviewer"
                    ? "bg-dark-800 border border-white/[0.06] text-slate-200"
                    : msg.role === "candidate"
                    ? "bg-cyan-500/10 border border-cyan-500/15 text-cyan-100"
                    : "bg-dark-800/50 border border-white/[0.04] text-slate-500 text-xs italic"
                }`}
              >
                {msg.content.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <p key={i} className="font-semibold text-white mt-2 mb-1">{line.replace(/\*\*/g, "")}</p>;
                  }
                  if (line.startsWith("• ")) {
                    return (
                      <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                        <span>{line.replace("• ", "")}</span>
                      </div>
                    );
                  }
                  if (line === "---") {
                    return <hr key={i} className="border-white/[0.08] my-3" />;
                  }
                  if (line.trim() === "") return <div key={i} className="h-2" />;
                  return <p key={i} className="my-0.5">{line}</p>;
                })}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm bg-gradient-to-br ${selectedCompany?.gradient || "from-cyan-500 to-blue-600"} text-white`}>
                {selectedCompany?.logo || "🎯"}
              </div>
              <div className="bg-dark-800 border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-slate-500 ml-2">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ── Input Area ─────────────────────── */}
      {phase.type === "prompting" && (
        <div className="sticky bottom-0 border-t border-white/[0.06] bg-dark-950/95 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-slate-400 font-medium">Write your prompt solution below</span>
            </div>
            <div className="relative">
              <textarea
                ref={promptRef}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Design your system prompt here... Be thorough — address the scenario requirements, constraints, edge cases, and output format."
                className="w-full h-40 rounded-xl bg-dark-800 border border-white/[0.08] text-sm text-slate-200 placeholder-slate-600 p-4 pr-14 resize-none focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 font-mono transition-all"
                disabled={loading}
              />
              <button
                onClick={submitPromptResponse}
                disabled={loading || promptText.trim().length < 10}
                className={`absolute bottom-3 right-3 p-2.5 rounded-lg transition-all ${
                  promptText.trim().length >= 10
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 shadow-lg shadow-cyan-500/20"
                    : "bg-dark-700 text-slate-600 cursor-not-allowed"
                }`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-600">{promptText.length} characters</span>
              <span className="text-xs text-slate-600">Press the send button when ready</span>
            </div>
          </div>
        </div>
      )}

      {phase.type === "answering-followup" && (
        <div className="sticky bottom-0 border-t border-white/[0.06] bg-dark-950/95 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-slate-400 font-medium">Answer the follow-up question</span>
            </div>
            <div className="relative">
              <textarea
                value={followupAnswer}
                onChange={(e) => setFollowupAnswer(e.target.value)}
                placeholder="Explain your approach to the follow-up question... Be specific and reference concrete prompt engineering techniques."
                className="w-full h-32 rounded-xl bg-dark-800 border border-white/[0.08] text-sm text-slate-200 placeholder-slate-600 p-4 pr-14 resize-none focus:outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/10 font-mono transition-all"
                disabled={loading}
              />
              <button
                onClick={submitFollowup}
                disabled={loading || followupAnswer.trim().length < 5}
                className={`absolute bottom-3 right-3 p-2.5 rounded-lg transition-all ${
                  followupAnswer.trim().length >= 5
                    ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:brightness-110 shadow-lg shadow-purple-500/20"
                    : "bg-dark-700 text-slate-600 cursor-not-allowed"
                }`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Final Scorecard ────────────────── */}
      {phase.type === "verdict" && scorecard && (
        <div className="border-t border-white/[0.06] bg-dark-950">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {/* Verdict Badge */}
            {(() => {
              const vc = verdictConfig(scorecard.verdict);
              const VerdictIcon = vc.icon;
              return (
                <div className={`rounded-2xl border ${vc.bg} p-6 mb-8 text-center`}>
                  <div className="text-4xl mb-3">{vc.emoji}</div>
                  <div className={`inline-flex items-center gap-2 text-2xl font-bold ${vc.color} mb-2`}>
                    <VerdictIcon className="h-6 w-6" />
                    {vc.label}
                  </div>
                  <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">{scorecard.verdictReasoning}</p>
                  <div className={`text-5xl font-black mt-4 ${scoreColor(scorecard.overallScore)}`}>
                    {scorecard.overallScore}<span className="text-lg text-slate-500">/100</span>
                  </div>
                </div>
              );
            })()}

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { label: "Technical Depth", data: scorecard.technicalDepth, icon: Brain },
                { label: "Edge Case Handling", data: scorecard.edgeCaseHandling, icon: Shield },
                { label: "Communication Clarity", data: scorecard.communicationClarity, icon: MessageSquare },
                { label: "Architectural Design", data: scorecard.architecturalDesign, icon: Zap },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl bg-dark-800 border border-white/[0.06] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-white">{item.label}</span>
                      </div>
                      <span className={`text-lg font-bold ${scoreColor(item.data.score)}`}>{item.data.score}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full rounded-full bg-dark-600 overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${scoreBg(item.data.score)} transition-all duration-1000`}
                        style={{ width: `${item.data.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{item.data.feedback}</p>
                  </div>
                );
              })}
            </div>

            {/* Improvement Areas */}
            {scorecard.improvementAreas && scorecard.improvementAreas.length > 0 && (
              <div className="rounded-xl bg-dark-800 border border-white/[0.06] p-5 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Areas to Improve</span>
                </div>
                <div className="space-y-2">
                  {scorecard.improvementAreas.map((area, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className="h-5 w-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs text-cyan-400 shrink-0 font-medium">
                        {i + 1}
                      </span>
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restart Button */}
            <div className="text-center">
              <button
                onClick={resetInterview}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 hover:brightness-110"
              >
                <RotateCcw className="h-4 w-4" />
                Start Another Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
