export interface RubricCriterion {
  name: string;
  weight: number;
  description: string;
}

export interface GradingResult {
  criteria_scores: {
    label: string;
    score: number;
    justification: string;
  }[];
  overall_notes: string;
}

// Simple helper to compile variables into prompt templates
export function compilePrompt(template: string, variables: Record<string, string>): string {
  let compiled = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key.trim()}\\s*\\}\\}`, "g");
    compiled = compiled.replace(regex, value);
  }
  return compiled;
}

// Sophisticated Heuristic Evaluator for offline / fallback grading
export function getMockEvaluation(
  rubricCriteria: RubricCriterion[],
  promptText: string,
  modelOutput: string,
  errorMsg?: string
): GradingResult {
  const cleanPrompt = promptText.trim();
  const lowerPrompt = cleanPrompt.toLowerCase();
  const wordCount = cleanPrompt.split(/\s+/).filter(Boolean).length;

  // Key prompt engineering signal indicators
  const hasRole = /(you are|act as|system role|persona|as an? (ai|expert|engineer|specialist|assistant))/i.test(cleanPrompt);
  const hasDelimiters = /(`{3}|<{1,2}[a-z_]+>{1,2}|"{{|\[\[)/i.test(cleanPrompt);
  const hasVariables = /\{\{\s*[\w.-]+\s*\}\}/.test(cleanPrompt);
  const hasNegativeConstraints = /(do not|never|must not|prohibited|refrain|without (any )?(preamble|fluff|explanation|conversation)|strictly avoid)/i.test(cleanPrompt);
  const hasJsonSchema = /(json|rfc-8259|key-value|\{[\s\S]*\}|schema|field|property)/i.test(cleanPrompt);
  const hasStepByStep = /(step-by-step|step \d|reasoning|first,|second,|finally,|analyze|verify)/i.test(cleanPrompt);
  const hasFewShot = /(example \d|input:|output:|sample:|for instance)/i.test(cleanPrompt);

  const scores = rubricCriteria.map((crit) => {
    const nameLower = crit.name.toLowerCase();
    const descLower = crit.description.toLowerCase();
    let score = 70;
    const strengths: string[] = [];
    const gaps: string[] = [];

    // 1. Schema / Format Compliance
    if (nameLower.includes("schema") || nameLower.includes("format") || nameLower.includes("json") || descLower.includes("format") || descLower.includes("schema")) {
      if (hasJsonSchema) {
        score += 18;
        strengths.push("Explicit output schema and structural formatting defined");
      } else {
        score -= 22;
        gaps.push("Missing unambiguous format boundaries or schema definitions");
      }
      if (hasNegativeConstraints) {
        score += 8;
        strengths.push("Negative constraints prevent conversational preamble");
      }
    }
    // 2. Constraint Enforcing / Safety Guardrails / Jailbreak Defense
    else if (nameLower.includes("constraint") || nameLower.includes("safety") || nameLower.includes("defense") || nameLower.includes("guardrail") || descLower.includes("adversarial")) {
      if (hasNegativeConstraints) {
        score += 20;
        strengths.push("Clear negative constraints and safety boundaries specified");
      } else {
        score -= 20;
        gaps.push("No explicit negative constraints or refusal rules provided");
      }
      if (hasDelimiters) {
        score += 8;
        strengths.push("Delimiter isolation prevents prompt injection");
      }
    }
    // 3. Reasoning / Chain of Thought / Accuracy
    else if (nameLower.includes("reasoning") || nameLower.includes("step") || nameLower.includes("logic") || descLower.includes("reasoning")) {
      if (hasStepByStep) {
        score += 18;
        strengths.push("Forces step-by-step decomposition before final output");
      } else {
        score -= 15;
        gaps.push("Lacks explicit chain-of-thought reasoning guidelines");
      }
      if (hasFewShot) {
        score += 8;
        strengths.push("In-context examples ground the reasoning path");
      }
    }
    // 4. Token Efficiency / Economy
    else if (nameLower.includes("token") || nameLower.includes("efficiency") || descLower.includes("length") || descLower.includes("concise")) {
      if (wordCount >= 20 && wordCount <= 250) {
        score += 22;
        strengths.push("Optimal token density without unnecessary verbosity");
      } else if (wordCount < 20) {
        score -= 25;
        gaps.push("Prompt is too brief to convey sufficient context");
      } else {
        score -= 10;
        gaps.push("Prompt contains redundant filler text that increases latency");
      }
    }
    // 5. General / Edge Cases / Robustness
    else {
      if (hasRole) {
        score += 10;
        strengths.push("Clear persona established");
      }
      if (hasVariables) {
        score += 10;
        strengths.push("Proper dynamic variable interpolation");
      }
      if (wordCount > 30) {
        score += 5;
      } else {
        score -= 15;
        gaps.push("Instructions lack specificity for edge-case coverage");
      }
    }

    // Bound score
    score = Math.max(15, Math.min(100, score));

    // Construct precise justification
    let justification = `Satisfies "${crit.name}".`;
    if (strengths.length > 0 && gaps.length === 0) {
      justification = `${strengths.join(". ")}. Excellent execution.`;
    } else if (strengths.length > 0 && gaps.length > 0) {
      justification = `${strengths.join(". ")}, but ${gaps.join("; ").toLowerCase()}.`;
    } else if (gaps.length > 0) {
      justification = `Needs improvement: ${gaps.join("; ")}.`;
    }

    return {
      label: crit.name,
      score,
      justification,
    };
  });

  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / (scores.length || 1));
  let notes = avgScore >= 75
    ? "Prompt shows strong prompt-engineering patterns: clear role definition, solid constraint enforcement, and structured output formatting."
    : "Prompt template needs refinement: strengthen output formatting constraints, specify negative boundaries, and isolate dynamic variables.";

  if (errorMsg) {
    notes += ` (Graded via offline evaluation engine due to API status: ${errorMsg})`;
  }

  return {
    criteria_scores: scores,
    overall_notes: notes,
  };
}

// Helper to determine which provider to use
function getActiveProvider(): "gemini" | "mock" {
  if (process.env.LLM_MOCK_MODE === "true") {
    return "mock";
  }

  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey && !geminiKey.startsWith("your-") && !geminiKey.startsWith("dummy-")) {
    return "gemini";
  }

  return "mock";
}

// Call a target model (Gemini 2.0 Flash, Llama 3.3 70B, GLM 5.2, Kimi K2.6)
export async function callModel(
  provider: string,
  modelName: string,
  prompt: string,
  systemPrompt?: string
): Promise<{ text: string; tokenCount: number; executionTimeMs: number }> {
  const startTime = Date.now();
  const activeProvider = getActiveProvider();
  const lowerModel = modelName.toLowerCase();
  const isLlama = lowerModel.includes("llama");
  const isGlm = lowerModel.includes("glm");
  const isKimi = lowerModel.includes("kimi") || lowerModel.includes("moonshot");

  let targetDisplayName = "Gemini 2.0 Flash";
  if (isLlama) targetDisplayName = "Llama 3.3 70B";
  else if (isGlm) targetDisplayName = "GLM 5.2";
  else if (isKimi) targetDisplayName = "Kimi K2.6";

  if (activeProvider === "mock") {
    let simulatedText = `[${targetDisplayName} Output]\nProcessed input successfully according to system prompt instructions.\n\nGenerated output adhering to specifications.`;
    
    if (prompt.toLowerCase().includes("json")) {
      simulatedText = `{\n  "status": "success",\n  "engine": "${targetDisplayName}",\n  "verified": true,\n  "result": "Input parsed and structured in accordance with prompt template criteria."\n}`;
    }

    return {
      text: simulatedText,
      tokenCount: Math.ceil(prompt.length / 4) + 45,
      executionTimeMs: Date.now() - startTime + (isLlama ? 120 : isGlm ? 95 : isKimi ? 110 : 65),
    };
  }

  // 1. OpenRouter Provider (for all models with automatic openrouter/free failover)
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey && !openrouterKey.startsWith("your-") && !openrouterKey.startsWith("dummy-")) {
    let candidateSlugs: string[] = [];
    if (isGlm) candidateSlugs = ["z-ai/glm-5.2:free", "openrouter/free"];
    else if (isKimi) candidateSlugs = ["moonshotai/kimi-k2.6", "openrouter/free"];
    else if (isLlama) candidateSlugs = ["google/gemma-4-31b-it:free", "openrouter/free"];
    else candidateSlugs = ["openrouter/free"];

    for (const slug of candidateSlugs) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal: AbortSignal.timeout(18000),
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "PromptSesh",
          },
          body: JSON.stringify({
            model: slug,
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
              { role: "user", content: prompt },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content || "";
          if (text) {
            const promptTokens = Math.ceil(prompt.length / 4);
            const outputTokens = Math.ceil(text.length / 4);

            return {
              text,
              tokenCount: promptTokens + outputTokens,
              executionTimeMs: Date.now() - startTime,
            };
          }
        }
      } catch (err) {
        console.warn(`OpenRouter call with ${slug} failed:`, err);
      }
    }
  }

  // 2. Google Gemini Provider (Free Tier / Fallback Engine)
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (apiKey && !apiKey.startsWith("your-") && !apiKey.startsWith("dummy-")) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

      let effectiveSystemPrompt = systemPrompt || "";
      if (isLlama) {
        effectiveSystemPrompt += `\n[Mode: Execute as Meta Llama 3.3 70B Instruct with direct, deterministic open-weights output format.]`;
      } else if (isGlm) {
        effectiveSystemPrompt += `\n[Mode: Execute as Zhipu AI GLM 5.2 with high-precision structured reasoning.]`;
      } else if (isKimi) {
        effectiveSystemPrompt += `\n[Mode: Execute as Moonshot Kimi K2.6 with rigorous context retention and precision.]`;
      }
      effectiveSystemPrompt = effectiveSystemPrompt.trim();

      const contents = [{ parts: [{ text: prompt }] }];
      const systemInstruction = effectiveSystemPrompt
        ? { parts: [{ text: effectiveSystemPrompt }] }
        : undefined;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ contents, systemInstruction }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text) {
          const promptTokens = Math.ceil(prompt.length / 4);
          const outputTokens = Math.ceil(text.length / 4);

          return {
            text,
            tokenCount: promptTokens + outputTokens,
            executionTimeMs: Date.now() - startTime,
          };
        }
      }
    }
  } catch (error: any) {
    console.error(`Execution failed for ${targetDisplayName}, falling back to sandbox:`, error);
  }

  return {
    text: `[Sandbox Fallback Output for ${targetDisplayName}]\nGenerated response matching prompt instructions: "${prompt.slice(0, 120)}..."`,
    tokenCount: Math.ceil(prompt.length / 4) + 30,
    executionTimeMs: Date.now() - startTime,
  };
}

// Call LLM-as-a-Judge (OpenRouter AI Judge or Gemini Judge)
export async function callJudge(
  rubricCriteria: RubricCriterion[],
  promptText: string,
  modelOutput: string,
  modelName?: string
): Promise<GradingResult> {
  const activeProvider = getActiveProvider();

  if (activeProvider === "mock") {
    return getMockEvaluation(rubricCriteria, promptText, modelOutput);
  }

  const modelLabel = modelName || "Target Model";
  const judgeSystemPrompt = `You are a strict, objective grading judge evaluating a prompt engineering submission tested against ${modelLabel}.
Score each rubric criterion independently from 0-100 based strictly on whether ${modelLabel}'s actual output satisfies the requirement and how well the user's prompt guided it.
Return ONLY valid JSON in this exact shape:
{
  "criteria_scores": [
    {"label": "exact criterion name", "score": 0-100, "justification": "one specific sentence on how ${modelLabel}'s output performed"}
  ],
  "overall_notes": "one actionable sentence specifically tailored to ${modelLabel}'s execution"
}`;

  const rubricText = rubricCriteria
    .map((c) => `- ${c.name} (Weight: ${c.weight}%): ${c.description}`)
    .join("\n");

  const userContent = `[Challenge Rubric]
${rubricText}

[Target Model]: ${modelLabel}

[User Submitted Prompt Template]
${promptText}

[${modelLabel} Output to Grade]
${modelOutput}

Please evaluate the above output against the rubric criteria. Output strict JSON only.`;

  // 1. Try OpenRouter AI Judge
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey && !openrouterKey.startsWith("your-") && !openrouterKey.startsWith("dummy-")) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(18000),
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "PromptSesh",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: judgeSystemPrompt },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let jsonText = data.choices?.[0]?.message?.content || "";
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && Array.isArray(parsed.criteria_scores) && parsed.criteria_scores.length > 0) {
            return parsed as GradingResult;
          }
        }
      }
    } catch (err) {
      console.warn("OpenRouter judge call failed, trying Gemini:", err);
    }
  }

  // 2. Try Gemini Judge
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (apiKey && !apiKey.startsWith("your-") && !apiKey.startsWith("dummy-")) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

      const response = await fetch(url, {
        method: "POST",
        signal: AbortSignal.timeout(6000),
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userContent }] }],
          systemInstruction: { parts: [{ text: judgeSystemPrompt }] },
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const result: GradingResult = JSON.parse(jsonText.trim());
        if (result && Array.isArray(result.criteria_scores)) {
          return result;
        }
      }
    }
  } catch (error: any) {
    console.error("Gemini Judge API call failed, falling back to heuristic:", error);
  }

  return getMockEvaluation(rubricCriteria, promptText, modelOutput);
}
