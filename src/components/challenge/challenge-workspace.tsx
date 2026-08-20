"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Play,
  Send,
  Eye,
  EyeOff,
  BarChart3,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronUp,
  Award,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { getDifficultyBg } from "@/lib/utils";
import type { MockChallenge } from "@/lib/mock-data";
import { generateSolutionFramework } from "@/lib/scraper";

const models = [
  { id: "llama-3.3-70b", name: "Llama 3.3 70B (Free)", provider: "Meta", color: "#3b82f6" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Free)", provider: "Google", color: "#22c55e" },
];

export function ChallengeWorkspace({
  challenge,
}: {
  challenge: MockChallenge;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getInitialVariables = () => {
    let variablesText = "";
    if (challenge.testInputs && challenge.testInputs[0]) {
      variablesText = Object.keys(challenge.testInputs[0])
        .map((key) => `${key.charAt(0).toUpperCase() + key.slice(1)}: {{${key}}}`)
        .join("\n");
    }
    return variablesText ? `\n\n${variablesText}` : "";
  };

  const [promptText, setPromptText] = useState(() => getInitialVariables());

  useEffect(() => {
    setPromptText(getInitialVariables());
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, 0);
    }
  }, [challenge.id]);

  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [crossModelEnabled, setCrossModelEnabled] = useState(false);
  const [hintsVisible, setHintsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "rubric" | "solution">(
    "description"
  );

  const copyToClipboard = () => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetPrompt = () => {
    setPromptText(getInitialVariables());
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, 0);
    }
  };

  const loadGoldenPrompt = () => {
    const defaultGolden = `You are a high-accuracy prompt engineering specialist. Analyze the input carefully and provide structured, precise output strictly following constraints.\n${getInitialVariables()}`;
    setPromptText(challenge.editorialSolution || defaultGolden);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Grading API states
  const [loading, setLoading] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleTab, setConsoleTab] = useState<"testcase" | "output" | "grading">("testcase");
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [submissionCount, setSubmissionCount] = useState(challenge.totalSubmissions || 0);
  const [currentAcceptance, setCurrentAcceptance] = useState(challenge.acceptanceRate || 0);

  const availableVariables = useMemo(() => {
    const keys = new Set<string>();
    if (challenge.testInputs && Array.isArray(challenge.testInputs)) {
      for (const item of challenge.testInputs) {
        if (item && typeof item === "object") {
          Object.keys(item).forEach((k) => keys.add(k));
        }
      }
    }
    return Array.from(keys);
  }, [challenge.testInputs]);

  const insertVariable = (varName: string) => {
    const tag = `{{${varName}}}`;
    const textarea = textareaRef.current;
    if (!textarea) {
      setPromptText((prev) => (prev ? `${prev} ${tag}` : tag));
      return;
    }
    const start = textarea.selectionStart ?? promptText.length;
    const end = textarea.selectionEnd ?? promptText.length;
    const nextText = promptText.substring(0, start) + tag + promptText.substring(end);
    setPromptText(nextText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  };

  const tokenEstimate = Math.ceil(promptText.split(/\s+/).filter(Boolean).length * 1.3);

  const runGradingPipeline = async () => {
    if (!promptText.trim()) {
      setErrorMsg("Please write a prompt template before running tests or submitting!");
      setShowConsole(true);
      setConsoleTab("testcase");
      return;
    }

    setLoading(true);
    setShowConsole(true);
    setConsoleTab("grading");
    setErrorMsg(null);
    setGradingResult(null);

    try {
      const response = await fetch(`/api/challenges/${challenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText,
          modelId: selectedModel,
          crossModel: crossModelEnabled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit prompt evaluation.");
      }

      setGradingResult(data.submission);

      // Increment live submission count
      const newCount = submissionCount + 1;
      const isPassed = data.submission?.passed;
      const prevPassed = Math.round((currentAcceptance / 100) * submissionCount);
      const newPassed = prevPassed + (isPassed ? 1 : 0);
      const newRate = Math.round((newPassed / newCount) * 1000) / 10;

      setSubmissionCount(newCount);
      setCurrentAcceptance(newRate);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission evaluation.");
      setConsoleTab("grading");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] bg-[#0F172A]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#192134]/90 backdrop-blur-sm px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/challenges"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <h1 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
            {challenge.title}
          </h1>
          <span
            className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold ${getDifficultyBg(
              challenge.difficulty
            )}`}
          >
            {challenge.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="hidden sm:flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
            {submissionCount > 0 ? `${currentAcceptance}% pass` : "N/A pass"}
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            {submissionCount > 0 ? `${submissionCount.toLocaleString()} runs` : "0 runs"}
          </span>
        </div>
      </div>

      {/* Split Panes */}
      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
        {/* ── LEFT PANEL: Problem Description ──────────── */}
        <div className="w-full md:w-1/2 overflow-y-auto border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#0F172A] shrink-0 md:shrink flex-1 max-h-[500px] md:max-h-none">
          {/* Tabs */}
          <div className="sticky top-0 z-10 flex border-b border-white/[0.08] bg-[#0F172A]/95 backdrop-blur-sm">
            {[
              { id: "description" as const, label: "Description" },
              { id: "rubric" as const, label: "Rubric" },
              { id: "solution" as const, label: "Solution Framework" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-xs font-semibold transition-colors relative cursor-pointer ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="space-y-6">
                {/* Category & metadata */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-[#192134] border border-white/[0.08] rounded px-2 py-0.5 text-slate-400">
                    {challenge.category}
                  </span>
                </div>

                {/* Description */}
                <div className="prose prose-sm prose-invert max-w-none space-y-3">
                  {(challenge.fullDescription || challenge.description).split("\n").map((line, i) => {
                    if (line.startsWith("### ")) {
                      return (
                        <h3 key={i} className="text-base font-bold text-white mt-6 mb-2 flex items-center gap-2">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("## ")) {
                      return (
                        <h2 key={i} className="text-lg font-bold text-emerald-400 mt-6 mb-2">
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("> ")) {
                      return (
                        <blockquote
                          key={i}
                          className="border-l-2 border-emerald-500/50 bg-emerald-500/5 pl-4 py-3 my-3 text-sm italic text-slate-300 rounded-r-lg"
                        >
                          {line.replace("> ", "")}
                        </blockquote>
                      );
                    }
                    if (line.trim() === "---") {
                      return <hr key={i} className="border-white/[0.08] my-4" />;
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-300 ml-2 my-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                          <span>{line.replace("- ", "")}</span>
                        </div>
                      );
                    }
                    if (line.trim() === "") return <div key={i} className="h-1" />;
                    return (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">
                        {line}
                      </p>
                    );
                  })}
                </div>

                {/* Constraints */}
                {challenge.constraints && challenge.constraints.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Constraints
                    </h3>
                    <div className="space-y-1.5">
                      {challenge.constraints.map((c, i) => (
                        <div
                          key={i}
                          className="text-xs text-slate-300 bg-amber-500/5 border border-amber-500/15 rounded-md p-3 font-mono"
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {challenge.hints && challenge.hints.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setHintsVisible(!hintsVisible)}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {hintsVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {hintsVisible ? "Hide Hints" : `Show Hints (${challenge.hints.length})`}
                    </button>
                    {hintsVisible && (
                      <div className="mt-3 space-y-2">
                        {challenge.hints.map((hint, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs text-slate-300 bg-purple-500/5 border border-purple-500/15 rounded-md p-3"
                          >
                            <span className="text-purple-400 font-mono text-[10px] shrink-0 font-bold">
                              #{i + 1}
                            </span>
                            {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "rubric" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Your submission will be scored against these criteria by an
                  automated judge engine. Each criterion has a weight determining its
                  contribution to your total rubric score.
                </p>
                {challenge.rubricCriteria.map((criterion, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[#192134] border border-white/[0.08] p-4"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-white">
                        {criterion.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {criterion.weight}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {criterion.description}
                    </p>
                    {/* Weight bar */}
                    <div className="h-1.5 w-full rounded-full bg-[#0F172A] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${criterion.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "solution" && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4 text-xs text-amber-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><strong>Editorial Solution Pattern:</strong> Review this expected prompt architecture after attempting your own.</span>
                  </div>
                  <button
                    onClick={loadGoldenPrompt}
                    className="inline-flex items-center gap-1.5 shrink-0 rounded bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 hover:text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Load Template
                  </button>
                </div>
                {(() => {
                  const solutionText = challenge.editorialSolution || generateSolutionFramework(challenge.title, challenge.category);
                  return (
                    <div className="prose prose-sm prose-invert max-w-none space-y-3">
                      {solutionText.split("\n").map((line, i) => {
                        if (line.startsWith("### ")) {
                          return (
                            <h3 key={i} className="text-sm font-bold text-emerald-400 mt-5 mb-2">
                              {line.replace("### ", "")}
                            </h3>
                          );
                        }
                        if (line.startsWith("#### ")) {
                          return (
                            <h4 key={i} className="text-xs font-bold text-white mt-3 mb-1">
                              {line.replace("#### ", "")}
                            </h4>
                          );
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 ml-2 my-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                              <span>{line.replace("- ", "")}</span>
                            </div>
                          );
                        }
                        if (line.trim() === "") return <div key={i} className="h-1" />;
                        return (
                          <p key={i} className="text-xs text-slate-300 leading-relaxed font-sans">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Prompt Editor & Console ────── */}
        <div className="w-full md:w-1/2 flex flex-col bg-[#0F172A] shrink-0 md:shrink overflow-visible md:overflow-hidden">
          {/* Top selection bar */}
          <div className="border-b border-white/[0.08] px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto bg-[#192134]">
            <div className="flex items-center gap-1.5 shrink-0">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer shrink-0 ${
                    selectedModel === model.id
                      ? "text-white bg-[#243044] border border-white/[0.14] font-semibold"
                      : "text-slate-400 hover:text-white border border-transparent"
                  }`}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full mr-1.5"
                    style={{ backgroundColor: model.color }}
                  />
                  {model.name}
                </button>
              ))}
            </div>

            {/* Cross-model toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCrossModelEnabled(!crossModelEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                  crossModelEnabled ? "bg-emerald-500" : "bg-[#243044]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                    crossModelEnabled ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                Test dual models
              </span>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-[200px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Prompt Template
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  title="Copy Prompt Template"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#192134] hover:bg-[#243044] border border-white/[0.08] transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetPrompt}
                  title="Reset Editor"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded bg-[#192134] hover:bg-[#243044] border border-white/[0.08] transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-slate-500 font-mono ml-1">
                  <Clock className="h-3.5 w-3.5" />
                  ~{tokenEstimate} tokens
                </div>
              </div>
            </div>

            {/* Variable insertion helper chips */}
            {availableVariables.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2.5 p-2 bg-[#0B1120] border border-white/[0.08] rounded-md shrink-0">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Variables:</span>
                {availableVariables.map((v: string) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono transition-all cursor-pointer"
                    title={`Click to insert {{${v}}} at cursor`}
                  >
                    <span className="font-bold">+</span>
                    <span>&#123;&#123;{v}&#125;&#125;</span>
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              autoFocus
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (!loading) {
                    runGradingPipeline();
                  }
                }
              }}
              placeholder="Write your system prompt instructions here... (Press ⌘+Enter or Ctrl+Enter to test)"
              className="prompt-studio-editor flex-1 w-full p-4 resize-none min-h-[140px]"
              spellCheck={false}
            />
          </div>

          {/* ── Console / Results bottom drawer ────────── */}
          {showConsole && (
            <div className="h-[38%] max-h-[45%] min-h-[140px] shrink-0 border-t border-white/[0.08] bg-[#0B1120] flex flex-col overflow-hidden">
              {/* Drawer Tabs */}
              <div className="flex items-center justify-between px-4 border-b border-white/[0.08] bg-[#192134] shrink-0">
                <div className="flex">
                  {[
                    { id: "testcase" as const, label: "Test Inputs", icon: BookOpen },
                    { id: "output" as const, label: "Model Output", icon: Sparkles, disabled: !gradingResult },
                    { id: "grading" as const, label: "Rubric Scorecard", icon: Award, disabled: !gradingResult && !loading },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      disabled={tab.disabled}
                      onClick={() => setConsoleTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all disabled:opacity-30 cursor-pointer ${
                        consoleTab === tab.id
                          ? "border-emerald-500 text-white bg-[#0F172A]"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowConsole(false)}
                  className="text-xs text-slate-500 hover:text-white py-1 px-2.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  Collapse
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4">
                {errorMsg && (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 flex items-start gap-2 font-mono">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Loading state */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
                    <p className="text-xs text-slate-400 font-mono">Executing prompt across LLM and evaluating rubric criteria...</p>
                  </div>
                )}

                {/* Tab 1: Test cases view */}
                {!loading && consoleTab === "testcase" && (
                  <div className="space-y-3">
                    {challenge.testInputs && challenge.testInputs.map((inputGroup, idx) => {
                      let compiledPreview = promptText;
                      Object.entries(inputGroup).forEach(([key, val]) => {
                        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
                        compiledPreview = compiledPreview.replace(regex, String(val));
                      });

                      return (
                        <div
                          key={idx}
                          className="rounded-md bg-[#192134] border border-white/[0.08] p-3.5 space-y-2.5 font-mono text-xs"
                        >
                          <div className="flex items-center justify-between text-slate-400 border-b border-white/[0.06] pb-1.5">
                            <span className="font-bold text-white">Test Case #{idx + 1}</span>
                            <span className="text-[10px] text-slate-500 uppercase">Input Payload</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {Object.entries(inputGroup).map(([k, v]) => (
                              <div key={k} className="bg-[#0F172A] p-2 rounded border border-white/[0.06]">
                                <span className="text-emerald-400 font-semibold">{k}: </span>
                                <span className="text-slate-300">{String(v)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-2 pt-2 border-t border-white/[0.06]">
                            <div className="text-[10px] text-slate-500 uppercase mb-1">Compiled Prompt Preview:</div>
                            <div className="bg-[#0F172A] p-2.5 rounded border border-white/[0.06] text-slate-300 whitespace-pre-wrap">
                              {compiledPreview}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Execution output */}
                {!loading && consoleTab === "output" && gradingResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between bg-[#192134] p-3 rounded border border-white/[0.08]">
                      <div>
                        <span className="text-slate-500 uppercase text-[10px]">Model: </span>
                        <span className="text-white font-bold">{gradingResult.modelName || selectedModel}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[10px]">Status: </span>
                        <span className={`font-bold ${gradingResult.passed ? "text-emerald-400" : "text-amber-400"}`}>
                          {gradingResult.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#192134] p-4 rounded border border-white/[0.08] space-y-2">
                      <div className="text-slate-500 text-[10px] uppercase">LLM Raw Output:</div>
                      <div className="bg-[#0F172A] p-3 rounded border border-white/[0.06] text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {gradingResult.rawResponse || "No output captured."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Grading Scorecard */}
                {!loading && consoleTab === "grading" && gradingResult && (
                  <div className="space-y-4">
                    {/* Score summary banner */}
                    <div className={`rounded-lg border p-4 flex items-center justify-between ${
                      gradingResult.passed
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-amber-500/10 border-amber-500/30"
                    }`}>
                      <div className="flex items-center gap-3">
                        {gradingResult.passed ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <XCircle className="h-6 w-6 text-amber-400" />
                        )}
                        <div>
                          <div className="text-sm font-bold text-white">
                            {gradingResult.passed ? "Challenge Solved Successfully!" : "Evaluation Criteria Not Met"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {gradingResult.passed ? "All criteria thresholds satisfied." : "Refine your system constraints and test again."}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white font-mono">
                          {Math.round(gradingResult.totalScore)}%
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">Rubric Score</div>
                      </div>
                    </div>

                    {/* Criteria breakdown */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Criteria Evaluation
                      </h4>
                      {gradingResult.scores?.map((scoreItem: any, idx: number) => {
                        const crit = challenge.rubricCriteria.find((c) => c.name === scoreItem.criterion?.name) || scoreItem.criterion;
                        return (
                          <div
                            key={idx}
                            className="rounded-md bg-[#192134] border border-white/[0.08] p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {scoreItem.passed ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                )}
                                <span className="text-xs font-semibold text-white">
                                  {crit?.name}
                                </span>
                              </div>
                              <span className="text-xs font-mono font-bold text-white">
                                {scoreItem.score} / 100
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed pl-6">
                              {scoreItem.feedback}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-white/[0.08] bg-[#192134] px-4 py-2.5 flex items-center justify-between shrink-0 sticky bottom-0 z-20">
            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              {promptText.length > 0 ? (
                <span>
                  {promptText.length} chars · ~{tokenEstimate} tokens
                </span>
              ) : (
                <span>Type prompt instructions above</span>
              )}
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setShowConsole(!showConsole);
                  if (!showConsole) setConsoleTab("testcase");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-md bg-[#0F172A] hover:bg-[#243044] border border-white/[0.08] transition-all cursor-pointer"
              >
                <ChevronUp className={`h-4 w-4 transition-transform ${showConsole ? "rotate-180" : ""}`} />
                <span>Console</span>
              </button>
              <button
                disabled={loading}
                onClick={runGradingPipeline}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.14] bg-[#0F172A] hover:bg-[#243044] px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current text-slate-400" />
                <span>Run Tests</span>
              </button>
              <button
                disabled={loading}
                onClick={runGradingPipeline}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-900 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
