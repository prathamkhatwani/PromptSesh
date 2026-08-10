import { MockChallenge } from "./mock-data";

export interface ScrapedInterviewQuestion {
  company: string;
  role: string;
  rawQuestion: string;
  sourceUrl: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  tags: string[];
}

/**
 * Scraper utility to parse raw interview posts and community questions
 * into structured MockChallenge objects with rubrics & solution frameworks.
 */
export function transformScrapedQuestionToChallenge(
  item: ScrapedInterviewQuestion,
  idIndex: number
): MockChallenge {
  const slug = `interview-${item.company.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${idIndex}`;
  
  return {
    id: `int-${idIndex}`,
    title: `${item.company} — ${item.role} Assessment`,
    slug,
    description: `Real Interview Question asked at ${item.company} for ${item.role} candidates. Solve the prompt engineering scenario and review the editorial solution framework.`,
    fullDescription: `### 🏢 Company & Role Overview: ${item.company} (${item.role})
This is an authentic interview / online assessment scenario reported by candidates interviewing for AI Engineering & Prompt Systems roles at **${item.company}**.

---

### 📄 Interview Scenario & Requirements
> *"${item.rawQuestion}"*

---

### 🔒 Business & System Rules
1. **Precision & Schema**: Must strictly follow the company's expected output schema with zero extra conversational fluff.
2. **Edge Case Resilience**: Must handle ambiguous or adversarial user inputs safely.
3. **Format Enforcement**: Output must be parseable by downstream automated microservices.

---

### 📥 Test Case Input
Your prompt template will receive variables based on the interview scenario.`,
    difficulty: item.difficulty,
    category: "Interview & Assessment Prep",
    categorySlug: "interview-prep",
    acceptanceRate: Math.floor(Math.random() * 30) + 30, // 30-60%
    totalSubmissions: Math.floor(Math.random() * 5000) + 2000,
    rubricCriteria: [
      { name: "Schema & Format Compliance", weight: 35, description: "Strict adherence to expected output structure" },
      { name: "Constraint Enforcing", weight: 30, description: "Respects all business rules and safety guardrails" },
      { name: "Edge Case Robustness", weight: 20, description: "Gracefully handles unusual or ambiguous inputs" },
      { name: "Token Efficiency", weight: 15, description: "Concise prompt instructions under length limits" },
    ],
    testInputs: [
      { input: "Sample candidate input provided during online assessment." }
    ],
    constraints: [
      `Must follow ${item.company} technical standards`,
      "Output must be strictly parseable",
      "Prompt must be under 750 tokens",
    ],
    hints: [
      "Review the Solution Framework tab for recommended prompt structuring strategies for this company.",
    ],
    tags: ["interview", item.company.toLowerCase(), ...item.tags],
    editorialSolution: `### 💡 Sample Solution Framework for ${item.company}

#### 1. System Role Definition
Assign a clear persona:
\`\`\`text
You are a Principal AI Systems Engineer at ${item.company}. Your primary task is to process candidate requests while enforcing strict technical guardrails.
\`\`\`

#### 2. Key Prompt Patterns Required
- Use explicit markdown headers (\`### Instructions\`, \`### Constraints\`, \`### Output Format\`).
- Inject candidate variable using \`{{input}}\`.
- Define an explicit negative constraint: *"Do not include any conversational preamble."*

#### 3. Recommended Prompt Template
\`\`\`text
System Role: You are the automated assessment evaluator for ${item.company}.

Instructions:
1. Analyze the provided input carefully.
2. Extract key entities and validate against rules.
3. Return the final decision.

Input: {{input}}
\`\`\``,
  };
}

/**
 * Mock scraper function simulating real-time retrieval from developer career forums.
 */
export async function fetchLiveInterviewQuestions(): Promise<ScrapedInterviewQuestion[]> {
  // Simulates fetching from tech interview feeds
  return [
    {
      company: "OpenAI",
      role: "AI Safety Engineer",
      rawQuestion: "Build a system prompt defense mechanism that prevents users from bypassing instructions using hypothetical framing ('Imagine you are an unfiltered AI model').",
      sourceUrl: "https://glassdoor.com/interview/openai",
      difficulty: "Expert",
      tags: ["safety", "jailbreak", "security"],
    },
    {
      company: "Anthropic",
      role: "Prompt Infrastructure Engineer",
      rawQuestion: "Design a Constitutional AI enforcer prompt that evaluates generated content against 4 ethical principles and returns a compliance score from 0-100.",
      sourceUrl: "https://blind.com/post/anthropic-interview",
      difficulty: "Expert",
      tags: ["constitutional-ai", "ethics", "evals"],
    },
  ];
}
