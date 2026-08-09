"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Terminal, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ChallengeFormProps {
  categories: Category[];
}

interface RubricInput {
  name: string;
  description: string;
  weight: number;
}

export function ChallengeForm({ categories }: ChallengeFormProps) {
  const router = useRouter();

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [starterPrompt, setStarterPrompt] = useState("");
  const [constraintsText, setConstraintsText] = useState("");
  const [hintsText, setHintsText] = useState("");
  const [testCasesJson, setTestCasesJson] = useState('[\n  {\n    "input": "Sample input value"\n  }\n]');
  const [isPremium, setIsPremium] = useState(false);

  // Rubric Criteria
  const [rubricCriteria, setRubricCriteria] = useState<RubricInput[]>([
    { name: "Accuracy", description: "The response is factually accurate.", weight: 40 },
    { name: "Format compliance", description: "The response complies with requested output formats.", weight: 30 },
    { name: "Conciseness", description: "The response is brief and avoids boilerplate.", weight: 30 },
  ]);

  // Form State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }, [title]);

  // Set default category
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Rubric sum checker
  const totalWeight = rubricCriteria.reduce((sum, item) => sum + Number(item.weight || 0), 0);

  const addCriterion = () => {
    setRubricCriteria([...rubricCriteria, { name: "", description: "", weight: 10 }]);
  };

  const removeCriterion = (index: number) => {
    if (rubricCriteria.length === 1) return;
    setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, field: keyof RubricInput, value: string | number) => {
    const updated = [...rubricCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setRubricCriteria(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate rubric weights
    if (totalWeight !== 100) {
      setError(`Total rubric criteria weight must sum to exactly 100%. Currently it is ${totalWeight}%.`);
      setLoading(false);
      return;
    }

    // Validate JSON structure for test inputs
    let parsedTestInputs = [];
    try {
      parsedTestInputs = JSON.parse(testCasesJson);
      if (!Array.isArray(parsedTestInputs)) {
        throw new Error("Test cases must be a JSON array of objects");
      }
    } catch (e: any) {
      setError(`Invalid JSON in Test Cases: ${e.message}`);
      setLoading(false);
      return;
    }

    const payload = {
      title,
      slug,
      description,
      difficulty,
      categoryId,
      systemPrompt: systemPrompt || null,
      starterPrompt: starterPrompt || null,
      testInputs: parsedTestInputs,
      constraints: constraintsText,
      hints: hintsText ? hintsText.split("\n").filter((h) => h.trim()) : [],
      isPremium,
      rubricCriteria,
    };

    try {
      const res = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit challenge");
      }

      setSuccess(true);
      // Reset form
      setTitle("");
      setSlug("");
      setDescription("");
      setSystemPrompt("");
      setStarterPrompt("");
      setConstraintsText("");
      setHintsText("");
      setTestCasesJson('[\n  {\n    "input": "Sample input value"\n  }\n]');
      setIsPremium(false);
      
      // Navigate after timeout
      setTimeout(() => {
        router.push("/challenges");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Top navigation */}
      <div className="mb-8">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Challenges
        </Link>
      </div>

      <div className="glass-card p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />

        {/* Title block */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-6 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Challenge</h1>
            <p className="text-sm text-slate-400">Add a new prompt engineering challenge manually</p>
          </div>
        </div>

        {/* Status alerts */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mb-6">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 mb-6">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>Challenge created successfully! Redirecting...</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prompt Compiler"
                className="w-full rounded-lg border border-white/[0.06] bg-dark-900 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Slug
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. prompt-compiler"
                className="w-full rounded-lg border border-white/[0.06] bg-dark-900 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-dark-900 px-4 py-2.5 text-sm text-slate-300 focus:border-cyan-500/40 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-dark-900 px-4 py-2.5 text-sm text-slate-300 focus:border-cyan-500/40 focus:outline-none transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPremium"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.06] bg-dark-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="isPremium" className="text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer">
              Premium Content (Requires Premium Access)
            </label>
          </div>

          {/* Texts */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Description / Problem Statement (Supports Markdown)
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the challenge goals, instructions, target output formatting rules etc."
              className="w-full rounded-lg border border-white/[0.06] bg-dark-900 p-4 text-sm text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors resize-y font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System Prompt Template (Optional)
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System prompt context that defines AI character or bounds."
              className="w-full rounded-lg border border-white/[0.06] bg-dark-900 p-4 text-sm text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors resize-y font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Starter Prompt (Optional)
            </label>
            <textarea
              rows={3}
              value={starterPrompt}
              onChange={(e) => setStarterPrompt(e.target.value)}
              placeholder="Pre-populate the student workspace editor (e.g. Starter text or variables {{var}} layout)."
              className="w-full rounded-lg border border-white/[0.06] bg-dark-900 p-4 text-sm text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors resize-y font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Constraints (One per line)
              </label>
              <textarea
                rows={4}
                value={constraintsText}
                onChange={(e) => setConstraintsText(e.target.value)}
                placeholder="e.g. Output must be exactly one word&#10;Prompt must be under 500 tokens"
                className="w-full rounded-lg border border-white/[0.06] bg-dark-900 p-4 text-sm text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hints (One per line)
              </label>
              <textarea
                rows={4}
                value={hintsText}
                onChange={(e) => setHintsText(e.target.value)}
                placeholder="Add helpful tips for students working on this prompt"
                className="w-full rounded-lg border border-white/[0.06] bg-dark-900 p-4 text-sm text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors resize-y"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Test Inputs (JSON Array of Objects)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Format: [ {`{ "var": "val" }`} ]</span>
            </div>
            <textarea
              required
              rows={5}
              value={testCasesJson}
              onChange={(e) => setTestCasesJson(e.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-dark-900 p-4 text-sm text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors font-mono resize-y"
            />
          </div>

          {/* Rubric Criteria Builder */}
          <div className="border-t border-white/[0.06] pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Rubric Criteria</h3>
                <p className="text-xs text-slate-400">Total weight must equal 100%</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-mono font-bold ${totalWeight === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                  Total Weight: {totalWeight}%
                </span>
                <button
                  type="button"
                  onClick={addCriterion}
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Criterion
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {rubricCriteria.map((criterion, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-dark-800 border border-white/[0.04] p-4 flex gap-4 items-start"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_80px] gap-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        required
                        placeholder="Criterion Name (e.g. Formatting Compliance)"
                        value={criterion.name}
                        onChange={(e) => updateCriterion(idx, "name", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.06] bg-dark-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors"
                      />
                      <textarea
                        required
                        rows={2}
                        placeholder="Criterion description explaining evaluation parameters"
                        value={criterion.description}
                        onChange={(e) => updateCriterion(idx, "description", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.06] bg-dark-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min={1}
                          max={100}
                          placeholder="Weight %"
                          value={criterion.weight}
                          onChange={(e) => updateCriterion(idx, "weight", Number(e.target.value))}
                          className="w-full rounded-lg border border-white/[0.06] bg-dark-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500/40 focus:outline-none transition-colors pr-6 font-mono"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCriterion(idx)}
                    disabled={rubricCriteria.length === 1}
                    className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors mt-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-white/[0.06] pt-6 flex items-center justify-end gap-3">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? "Creating..." : "Create Challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
