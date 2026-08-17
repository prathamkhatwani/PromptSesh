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
  { id: "llama-3.3-70b", name: "Llama 3.3 70B (Free)", provider: "Meta / OpenRouter", color: "#0081fb" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Free)", provider: "Google / OpenRouter", color: "#4285f4" },
  { id: "gpt4", name: "GPT-4o", provider: "OpenAI", color: "#74aa9c" },
  { id: "claude", name: "Claude 3.5 Sonnet", provider: "Anthropic", color: "#d4a574" },
];

export function ChallengeWorkspace({
  challenge,
}: {
  challenge: MockChallenge;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [promptText, setPromptText] = useState(() => {
    let variablesText = "";
    if (challenge.testInputs && challenge.testInputs[0]) {
      variablesText = Object.keys(challenge.testInputs[0])
        .map((key) => `${key.charAt(0).toUpperCase() + key.slice(1)}: {{${key}}}`)
        .join("\n");
    }
    return variablesText ? `\n\n${variablesText}` : "";
  });

  useEffect(() => {
    setPromptText(getInitialVariables());
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, 0);
    }
  }, [challenge.id]);

  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b");
  const [crossModelEnabled, setCrossModelEnabled] = useState(false);
  const [hintsVisible, setHintsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "rubric" | "solution">(
    "description"
  );

  const getInitialVariables = () => {
    let variablesText = "";
    if (challenge.testInputs && challenge.testInputs[0]) {
      variablesText = Object.keys(challenge.testInputs[0])
        .map((key) => `${key.charAt(0).toUpperCase() + key.slice(1)}: {{${key}}}`)
        .join("\n");
    }
    return variablesText ? `\n\n${variablesText}` : "";
  };

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
    <div className="flex flex-col min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-dark-900/80 backdrop-blur-sm px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/challenges"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <h1 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
            {challenge.title}
          </h1>
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getDifficultyBg(
              challenge.difficulty
            )}`}
          >
            {challenge.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="hidden sm:flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
            {submissionCount > 0 ? `${currentAcceptance}% acceptance` : "N/A acceptance"}
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-purple-400" />
            {submissionCount > 0 ? `${submissionCount.toLocaleString()} submissions` : "0 submissions"}
          </span>
        </div>
      </div>

      {/* Split Panes */}
      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
        {/* ── LEFT PANEL: Problem Description ──────────── */}
        <div className="w-full md:w-1/2 overflow-y-auto border-b md:border-b-0 md:border-r border-white/[0.06] bg-dark-950 shrink-0 md:shrink flex-1 max-h-[500px] md:max-h-none">
          {/* Tabs */}
          <div className="sticky top-0 z-10 flex border-b border-white/[0.06] bg-dark-950/95 backdrop-blur-sm">
            {[
              { id: "description" as const, label: "Description" },
              { id: "rubric" as const, label: "Rubric" },
              { id: "solution" as const, label: "Solution Framework" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                  activeTab === tab.id
                    ? "text-white font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="space-y-6">
                {/* Category & metadata */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1 text-slate-400">
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
                        <h2 key={i} className="text-lg font-bold text-cyan-400 mt-6 mb-2">
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("> ")) {
                      return (
                        <blockquote
                          key={i}
                          className="border-l-2 border-cyan-500/50 bg-cyan-500/5 pl-4 py-3 my-3 text-sm italic text-slate-300 rounded-r-lg shadow-inner"
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
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
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
                    <h3 className="text-sm font-semibold text-white mb-2">
                      Constraints
                    </h3>
                    <div className="space-y-1.5">
                      {challenge.constraints.map((c, i) => (
                        <div
                          key={i}
                          className="text-xs text-slate-400 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3"
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
                      className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
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
                            className="flex items-start gap-2 text-sm text-slate-400 bg-purple-500/5 border border-purple-500/10 rounded-lg p-3"
                          >
                            <span className="text-purple-400 font-mono text-xs shrink-0">
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
                <p className="text-sm text-slate-400 mb-6">
                  Your submission will be scored against these criteria by an
                  AI judge. Each criterion has a weight that determines its
                  contribution to your total score.
                </p>
                {challenge.rubricCriteria.map((criterion, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-dark-800 border border-white/[0.04] p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">
                        {criterion.name}
                      </h4>
                      <span className="text-xs font-mono text-cyan-400">
                        {criterion.weight}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      {criterion.description}
                    </p>
                    {/* Weight bar */}
                    <div className="h-1.5 w-full rounded-full bg-dark-600 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                        style={{ width: `${criterion.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "solution" && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 text-xs text-amber-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><strong>Editorial Solution Pattern:</strong> Review this expected prompt structure after attempting your own prompt template.</span>
                  </div>
                  <button
                    onClick={loadGoldenPrompt}
                    className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 hover:text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Load Golden Prompt
                  </button>
                </div>
                {(() => {
                  const solutionText = challenge.editorialSolution || generateSolutionFramework(challenge.title, challenge.category);
                  return (
                    <div className="prose prose-sm prose-invert max-w-none space-y-3">
                      {solutionText.split("\n").map((line, i) => {
                        if (line.startsWith("### ")) {
                          return (
                            <h3 key={i} className="text-base font-bold text-cyan-400 mt-6 mb-2">
                              {line.replace("### ", "")}
                            </h3>
                          );
                        }
                        if (line.startsWith("#### ")) {
                          return (
                            <h4 key={i} className="text-sm font-bold text-white mt-4 mb-1">
                              {line.replace("#### ", "")}
                            </h4>
                          );
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-300 ml-2 my-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
                              <span>{line.replace("- ", "")}</span>
                            </div>
                          );
                        }
                        if (line.trim() === "") return <div key={i} className="h-1" />;
                        return (
                          <p key={i} className="text-sm text-slate-300 leading-relaxed font-sans">
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
        <div className="w-full md:w-1/2 flex flex-col bg-dark-900 shrink-0 md:shrink overflow-visible md:overflow-hidden">
          {/* Top selection bar */}
          <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1 shrink-0">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                    selectedModel === model.id
                      ? "text-white bg-white/[0.08] border border-white/[0.12]"
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
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
                  crossModelEnabled ? "bg-cyan-500" : "bg-dark-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                    crossModelEnabled ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                Test across all models
              </span>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-[200px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Your Prompt Template
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={copyToClipboard}
                  title="Copy Prompt Template"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 px-2 py-1 rounded bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
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
                  title="Reset Editor to Blank Template"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono ml-1">
                  <Clock className="h-3.5 w-3.5" />
                  ~{tokenEstimate} tokens
                </div>
              </div>
            </div>

            {/* Variable insertion helper chips */}
            {availableVariables.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2.5 p-2 bg-dark-950/60 border border-white/[0.04] rounded-lg shrink-0">
                <span className="text-[11px] font-semibold text-slate-400">Insert Variable:</span>
                {availableVariables.map((v: string) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                    title={`Click to insert {{${v}}} at cursor`}
                  >
                    <span className="text-cyan-400 font-bold">+</span>
                    <span>&#123;&#123;{v}&#125;&#125;</span>
                  </button>
                ))}
              </div>
            )}

            {/* Instruction watermark banner */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2 mb-2 text-xs text-cyan-300 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span><strong>Write your prompt instructions below</strong> (e.g. <em>"Analyze the problem and provide a step-by-step solution"</em>)</span>
              </div>
              <span className="hidden sm:inline-flex items-center text-[10px] text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                ⌘↵ to run
              </span>
            </div>

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
              placeholder="Write your prompt instructions here... (Press ⌘+Enter or Ctrl+Enter to test)"
              className="prompt-editor flex-1 w-full p-4 resize-none min-h-[120px]"
              spellCheck={false}
            />
          </div>

          {/* ── Console / Results bottom drawer ────────── */}
          {showConsole && (
            <div className="h-[35%] max-h-[42%] min-h-[140px] shrink-0 border-t border-white/[0.08] bg-dark-950 flex flex-col overflow-hidden">
              {/* Drawer Tabs */}
              <div className="flex items-center justify-between px-4 border-b border-white/[0.06] bg-dark-900/60 shrink-0">
                <div className="flex">
                  {[
                    { id: "testcase" as const, label: "Test Cases", icon: BookOpen },
                    { id: "output" as const, label: "Execution Output", icon: Sparkles, disabled: !gradingResult },
                    { id: "grading" as const, label: "Rubric Grade", icon: Award, disabled: !gradingResult && !loading },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      disabled={tab.disabled}
                      onClick={() => setConsoleTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all disabled:opacity-30 ${
                        consoleTab === tab.id
                          ? "border-cyan-500 text-white bg-white/[0.02]"
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
                  className="text-xs text-slate-500 hover:text-white py-1 px-2.5 rounded hover:bg-white/[0.04] transition-colors"
                >
                  Collapse
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {errorMsg && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 flex gap-2">
                    <XCircle className="h-5 w-5 shrink-0" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Loading state */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">Evaluating prompt outputs against rubric criteria...</p>
                  </div>
                )}

                {/* Tab 1: Test cases view */}
                {!loading && consoleTab === "testcase" && (
                  <div className="space-y-3">
                    {challenge.testInputs && challenge.testInputs.map((inputGroup, idx) => {
                      let compiledPreview = promptText;
                      Object.entries(inputGroup).forEach(([k, v]) => {
                        compiledPreview = compiledPreview.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), String(v));
                      });

                      return (
                        <div
                          key={idx}
                          className="rounded-lg bg-dark-900 border border-white/[0.06] p-4 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Case #{idx + 1} Variables</span>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(inputGroup).map(([key, value]) => (
                              <div key={key} className="space-y-0.5">
                                <div className="font-mono text-cyan-400 text-[11px]">
                                  {`{{${key}}}`}
                                </div>
                                <div className="text-slate-300 pl-2.5 border-l-2 border-cyan-500/30 whitespace-pre-wrap leading-relaxed text-xs">
                                  {String(value)}
                                </div>
                              </div>
                            ))}
                          </div>

                          {promptText.trim() && (
                            <div className="pt-2 border-t border-white/[0.04]">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Compiled Prompt Preview:
                              </div>
                              <pre className="font-mono text-[11px] text-slate-300 bg-dark-950 p-2.5 rounded border border-white/[0.04] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                                {compiledPreview}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Model output view */}
                {!loading && consoleTab === "output" && gradingResult && (
                  <div className="space-y-4">
                    {gradingResult.modelTestResults?.map((res: any, idx: number) => (
                      <div key={idx} className="space-y-3 rounded-lg bg-dark-900 border border-white/[0.06] p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">
                            Generated Output ({res.modelProvider} · {res.modelName})
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            Latency: {res.latencyMs}ms
                          </span>
                        </div>
                        {res.compiledPrompt && (
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Evaluated Prompt Sent to Model:
                            </div>
                            <pre className="p-3 rounded border border-white/[0.04] bg-dark-950 text-[11px] text-cyan-300/90 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                              {res.compiledPrompt}
                            </pre>
                          </div>
                        )}
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Model Response:
                          </div>
                          <pre className="p-3 rounded border border-white/[0.04] bg-dark-950 text-xs text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                            {res.rawOutput}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Detailed rubric breakdown grading */}
                {!loading && consoleTab === "grading" && gradingResult && (
                  <div className="space-y-6">
                    {/* Overall Score Banner */}
                    <div className="flex items-center justify-between rounded-xl bg-dark-900 border border-white/[0.06] p-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              gradingResult.passed ? "text-emerald-400" : "text-amber-500"
                            }`}
                          >
                            {gradingResult.passed ? "Accepted" : "Rejected"}
                          </span>
                          {gradingResult.cached && (
                            <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold px-2 py-0.5 rounded">
                              Cached Result
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Compiled in {gradingResult.executionTime}ms · {gradingResult.tokenCount} tokens
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">
                          {Math.round(gradingResult.totalScore)}%
                        </div>
                        <div className="text-xs text-slate-500">Rubric Score</div>
                      </div>
                    </div>

                    {/* Criteria list */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Criteria Scores
                      </h4>
                      {gradingResult.scores?.map((scoreItem: any, idx: number) => {
                        // Match with criteria names from challenge info
                        const crit = challenge.rubricCriteria.find((c) => c.name === scoreItem.criterion?.name) || scoreItem.criterion;
                        return (
                          <div
                            key={idx}
                            className="rounded-lg bg-dark-900 border border-white/[0.04] p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {scoreItem.passed ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                                ) : (
                                  <XCircle className="h-4.5 w-4.5 text-amber-500" />
                                )}
                                <span className="text-sm font-semibold text-slate-200">
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
          <div className="border-t border-white/[0.06] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500">
              {promptText.length > 0 ? (
                <span>
                  {promptText.length} characters · ~{tokenEstimate} tokens
                </span>
              ) : (
                <span>Start typing your prompt...</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowConsole(true);
                  setConsoleTab("testcase");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                <ChevronUp className={`h-4 w-4 transition-transform ${showConsole ? "rotate-180" : ""}`} />
                Console
              </button>
              <button
                disabled={loading}
                onClick={runGradingPipeline}
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                Run Tests
              </button>
              <button
                disabled={loading}
                onClick={runGradingPipeline}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
