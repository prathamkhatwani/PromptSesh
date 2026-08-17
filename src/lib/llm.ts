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

// Heuristic Mock Evaluator fallback
function getMockEvaluation(
  rubricCriteria: RubricCriterion[],
  promptText: string,
  modelOutput: string,
  errorMsg?: string
): GradingResult {
  const scores = rubricCriteria.map((crit) => {
    let score = 75;

    if (promptText.length > 50) score += 10;
    else score -= 15;

    if (promptText.includes("{{") && promptText.includes("}}")) score += 5;

    const descriptionLower = crit.description.toLowerCase();
    if (descriptionLower.includes("formatting") || descriptionLower.includes("json")) {
      if (promptText.toLowerCase().includes("json") || promptText.toLowerCase().includes("format")) {
        score += 8;
      } else {
        score -= 10;
      }
    }

    score = Math.max(10, Math.min(100, score));

    return {
      label: crit.name,
      score,
      justification: `Sandbox Evaluation: Your prompt successfully satisfies the "${crit.name}" criteria.`,
    };
  });

  let notes = "Offline sandbox mode active. Results have been simulated locally.";
  if (errorMsg) {
    notes = `API Fallback: An LLM API connection error occurred (${errorMsg}). Temporarily falling back to sandbox evaluation.`;
  }

  return {
    criteria_scores: scores,
    overall_notes: notes,
  };
}

// Helper to determine which provider to use
function getActiveProvider(): "openrouter" | "gemini" | "openai" | "mock" {
  if (process.env.LLM_MOCK_MODE === "true") {
    return "mock";
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey && !openrouterKey.startsWith("your-") && !openrouterKey.startsWith("dummy-")) {
    return "openrouter";
  }

  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey && !geminiKey.startsWith("your-") && !geminiKey.startsWith("dummy-")) {
    return "gemini";
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.startsWith("your-") && !openaiKey.startsWith("dummy-")) {
    return "openai";
  }

  return "mock";
}

// Call a target model
export async function callModel(
  provider: string,
  modelName: string,
  prompt: string,
  systemPrompt?: string
): Promise<{ text: string; tokenCount: number; executionTimeMs: number }> {
  const startTime = Date.now();
  const activeProvider = getActiveProvider();

  if (activeProvider === "mock") {
    const text = `[Mock Output]\nThis is a local sandbox response. Your compiled prompt was:\n\n"${prompt.substring(0, 100)}..."`;
    return {
      text,
      tokenCount: Math.ceil(prompt.length / 4) + 30,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // 1. OpenRouter Provider (Free Tier Llama 3.3 70B & Gemini 2.0 Flash)
  if (activeProvider === "openrouter") {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      const targetModel = modelName.includes("llama")
        ? "meta-llama/llama-3.3-70b-instruct:free"
        : "google/gemini-2.0-flash-exp:free";

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://promptsesh.com",
          "X-Title": "PromptSesh",
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      const promptTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(text.length / 4);

      return {
        text,
        tokenCount: promptTokens + outputTokens,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error("OpenRouter execution failed, falling back to mock:", error);
      return {
        text: `[Sandbox Fallback Output]\n(OpenRouter API failed: ${error.message || error}). Running in sandbox mode.`,
        tokenCount: Math.ceil(prompt.length / 4) + 10,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  // 2. Google Gemini Provider
  if (activeProvider === "gemini") {
    try {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      const targetModel = "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;

      const contents = [{ parts: [{ text: prompt }] }];
      const systemInstruction = systemPrompt
        ? { parts: [{ text: systemPrompt }] }
        : undefined;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey! },
        body: JSON.stringify({ contents, systemInstruction }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const promptTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(text.length / 4);

      return {
        text,
        tokenCount: promptTokens + outputTokens,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error("Gemini model execution failed, falling back to mock:", error);
      return {
        text: `[Sandbox Fallback Output]\n(Running in sandbox mode).`,
        tokenCount: Math.ceil(prompt.length / 4) + 40,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  // 2. OpenAI Provider (ChatGPT gpt-4o-mini)
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const tokenCount = data.usage?.total_tokens || (Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4));

    return {
      text,
      tokenCount,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error("OpenAI model execution failed, falling back to mock:", error);
    return {
      text: `[Sandbox Fallback Output]\n(Failed to reach ChatGPT API: ${error.message || error}). Running in sandbox mode.`,
      tokenCount: Math.ceil(prompt.length / 4) + 10,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

// Call LLM-as-a-Judge (Gemini or OpenAI depending on key availability)
export async function callJudge(
  rubricCriteria: RubricCriterion[],
  promptText: string,
  modelOutput: string
): Promise<GradingResult> {
  const activeProvider = getActiveProvider();

  if (activeProvider === "mock") {
    return getMockEvaluation(rubricCriteria, promptText, modelOutput);
  }

  const judgeSystemPrompt = `You are a strict, consistent grading judge for a prompt-engineering practice platform. You will be given:
1. A rubric with weighted criteria
2. The user's submitted prompt
3. The model output produced by running that prompt

Score each criterion independently from 0-100 based ONLY on its written description. Do not be swayed by writing quality or length beyond what each criterion asks for. Return ONLY valid JSON in this exact shape:

{
  "criteria_scores": [
    {"label": "...", "score": 0-100, "justification": "one sentence"}
  ],
  "overall_notes": "one or two sentences of actionable feedback for the user"
}

Be consistent: if you would give this same output the same score on a repeat grading, do so. Do not invent criteria not listed in the rubric.`;

  const rubricText = rubricCriteria
    .map((c) => `- ${c.name} (Weight: ${c.weight}%): ${c.description}`)
    .join("\n");

  const userContent = `[Challenge Rubric]
${rubricText}

[User Submitted Prompt Template]
${promptText}

[Model Output to Grade]
${modelOutput}

Please evaluate the above model output against the user prompt template and rubric criteria. Output JSON.`;

  // 1. Google Gemini Judge
  if (activeProvider === "gemini") {
    try {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey! },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userContent }] }],
          systemInstruction: { parts: [{ text: judgeSystemPrompt }] },
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Judge API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      const result: GradingResult = JSON.parse(jsonText.trim());
      return result;
    } catch (error: any) {
      console.error("Gemini Judge API call failed, falling back to mock:", error);
      return getMockEvaluation(rubricCriteria, promptText, modelOutput, error.message || "Connection error");
    }
  }

  // 2. OpenAI Judge (ChatGPT gpt-4o-mini)
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: judgeSystemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Judge API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const jsonText = data.choices?.[0]?.message?.content || "{}";
    
    const result: GradingResult = JSON.parse(jsonText.trim());
    return result;
  } catch (error: any) {
    console.error("OpenAI Judge API call failed, falling back to mock:", error);
    return getMockEvaluation(rubricCriteria, promptText, modelOutput, error.message || "Connection error");
  }
}
