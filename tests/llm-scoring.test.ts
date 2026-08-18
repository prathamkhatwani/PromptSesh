import { describe, it, expect } from "vitest";
import { compilePrompt, getMockEvaluation } from "@/lib/llm";

describe("LLM Scoring & Compiler Suite", () => {
  describe("compilePrompt", () => {
    it("should interpolate template variables correctly", () => {
      const template = "Analyze invoice from {{vendor}} for the amount of {{amount}}.";
      const testInputs = { vendor: "Stripe", amount: "$450" };
      const compiled = compilePrompt(template, testInputs);
      expect(compiled).toBe("Analyze invoice from Stripe for the amount of $450.");
    });

    it("should handle multiple duplicate variable occurrences", () => {
      const template = "{{name}} is a developer. Welcome {{name}}!";
      const testInputs = { name: "Alice" };
      const compiled = compilePrompt(template, testInputs);
      expect(compiled).toBe("Alice is a developer. Welcome Alice!");
    });
  });

  describe("getMockEvaluation Heuristic Engine", () => {
    const sampleCriteria = [
      { name: "JSON Formatting", weight: 40, description: "Must output strictly valid JSON" },
      { name: "Constraint Adherence", weight: 30, description: "Must follow all guardrails" },
      { name: "Clarity & Persona", weight: 30, description: "Must define a clear expert persona" },
    ];

    it("should reward structured prompt engineering techniques", () => {
      const prompt = `SYSTEM: You are an expert financial auditor.\nExtract the line items into valid JSON schema.\nDo not include conversational preamble or markdown codeblocks.\n\nInput: {{invoice}}`;
      const modelOutput = `{"vendor": "Acme", "total": 100}`;

      const evaluation = getMockEvaluation(sampleCriteria, prompt, modelOutput);
      expect(evaluation.criteria_scores.length).toBe(sampleCriteria.length);

      const jsonScore = evaluation.criteria_scores.find(s => s.label === "JSON Formatting");
      expect(jsonScore).toBeDefined();
      expect(jsonScore!.score).toBeGreaterThanOrEqual(85);

      const constraintScore = evaluation.criteria_scores.find(s => s.label === "Constraint Adherence");
      expect(constraintScore).toBeDefined();
      expect(constraintScore!.score).toBeGreaterThanOrEqual(80);
    });

    it("should penalize basic/empty prompts lacking structure", () => {
      const basicPrompt = "Just format this text";
      const basicOutput = "here is the output";

      const evaluation = getMockEvaluation(sampleCriteria, basicPrompt, basicOutput);
      const jsonScore = evaluation.criteria_scores.find(s => s.label === "JSON Formatting");
      expect(jsonScore!.score).toBeLessThanOrEqual(65);
    });
  });
});
