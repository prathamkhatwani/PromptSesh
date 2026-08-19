import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { compilePrompt, callModel, callJudge } from "@/lib/llm";
import { SubmissionStatus } from "@prisma/client";
import * as mock from "@/lib/mock-data";
import { checkDbConnection } from "@/lib/queries";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { submitChallengeSchema } from "@/lib/validations/challenge";
import { captureError, logLLMTelemetry } from "@/lib/observability";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: any = null;
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    // Rate limit: prefer authenticated userId over spoofable x-forwarded-for
    const rateLimitKey = getRateLimitIdentifier(req, userId);
    const rateLimitResult = await checkRateLimit(rateLimitKey, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can make up to 10 prompt evaluations per minute." },
        { status: 429 }
      );
    }

    const { id } = await params;
    body = await req.json();
    const parseResult = submitChallengeSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || "Invalid submission payload.";
      return NextResponse.json(
        { error: errorMessage, details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { promptText, modelId = "gemini-2.0-flash", crossModel = false } = parseResult.data;

    const customInstructions = promptText
      .replace(/\{\{.*?\}\}/g, "")
      .replace(/^[A-Za-z0-9_\s]+:\s*/gm, "")
      .trim();

    if (!customInstructions || customInstructions.length < 5) {
      return NextResponse.json(
        { error: "Please write your prompt instructions before submitting! An empty prompt template cannot be evaluated." },
        { status: 400 }
      );
    }

    const isDbConnected = await checkDbConnection();

    // ───────────────── OFFLINE / MOCK DATABASE FALLBACK ─────────────────
    if (!isDbConnected) {
      
      // Look up challenge from mock-data by ID or Slug
      const mockChallenge = mock.challenges.find(c => c.id === id || c.slug === id);
      if (!mockChallenge) {
        return NextResponse.json({ error: "Challenge not found in mock data" }, { status: 404 });
      }

      // Compile user prompt
      const testCases = mockChallenge.testInputs || [{}];
      const testCase = testCases[0] || {};
      const compiledPrompt = compilePrompt(promptText, testCase);

      const isLlamaSelected = (modelId || "").toLowerCase().includes("llama");
      const targetModelsToRun = crossModel
        ? [
            { provider: "Meta", name: "llama-3.3-70b" },
            { provider: "Google", name: "gemini-2.0-flash" },
          ]
        : [
            {
              provider: isLlamaSelected ? "Meta" : "Google",
              name: isLlamaSelected ? "llama-3.3-70b" : "gemini-2.0-flash",
            },
          ];

      // Model execution across requested targets
      const executions = await Promise.all(
        targetModelsToRun.map(async (m) => {
          const res = await callModel(
            m.provider,
            m.name,
            compiledPrompt,
            mockChallenge.constraints ? mockChallenge.constraints.join("\n") : undefined
          );
          return {
            ...m,
            ...res,
          };
        })
      );

      const primaryExecution = executions[0];

      // Call judge evaluation (uses mock heuristic when API key is missing)
      const judgeGrades = await callJudge(
        mockChallenge.rubricCriteria,
        promptText,
        primaryExecution.text
      );

      // Calculate aggregate weighted scores
      let totalScore = 0;
      const mockScoresList = mockChallenge.rubricCriteria.map((crit, idx) => {
        const judgeScore = judgeGrades.criteria_scores.find(
          (s) => s.label.toLowerCase() === crit.name.toLowerCase()
        );
        const scoreValue = judgeScore ? judgeScore.score : 80;
        totalScore += scoreValue * (crit.weight / 100);

        return {
          id: `mock-score-${idx}`,
          submissionId: "mock-sub-id",
          criterionId: `crit-${idx}`,
          score: scoreValue,
          passed: scoreValue >= 70,
          feedback: judgeScore?.justification || "Satisfies criteria guidelines.",
          criterion: { name: crit.name },
        };
      });

      const mockSubmission = {
        id: "mock-sub-id",
        userId: "anonymous",
        challengeId: id,
        promptText,
        status: "COMPLETED",
        totalScore,
        passed: totalScore >= 70,
        tokenCount: primaryExecution.tokenCount,
        executionTime: primaryExecution.executionTimeMs,
        scores: mockScoresList,
        modelTestResults: executions.map((exec, idx) => ({
          id: `mock-res-${idx}`,
          submissionId: "mock-sub-id",
          modelProvider: exec.provider,
          modelName: exec.name,
          compiledPrompt: compiledPrompt,
          rawOutput: exec.text,
          latencyMs: exec.executionTimeMs,
          score: totalScore,
          passed: totalScore >= 70,
        })),
        cached: false,
      };

      // Increment live mock challenge counter
      mockChallenge.totalSubmissions = (mockChallenge.totalSubmissions || 0) + 1;
      const isPassed = mockSubmission.passed;
      mockChallenge.acceptanceRate = isPassed ? 100 : 0;

      return NextResponse.json({
        success: true,
        cached: false,
        submission: mockSubmission,
      });
    }

    // ───────────────── LIVE DATABASE CONNECTED FLOW ─────────────────
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized — sign in required" }, { status: 401 });
    }

    const finalUserId = userId;

    // Fetch challenge & criteria
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        rubric: {
          include: {
            criteria: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const criteria = challenge.rubric?.criteria || [];
    if (criteria.length === 0) {
      return NextResponse.json(
        { error: "Challenge has no grading rubric configured" },
        { status: 400 }
      );
    }

    // Check Cache
    const cachedSubmission = await prisma.submission.findFirst({
      where: {
        userId: finalUserId,
        challengeId: challenge.id,
        promptText: promptText.trim(),
        status: SubmissionStatus.COMPLETED,
      },
      include: {
        scores: {
          include: {
            criterion: true,
          },
        },
        modelTestResults: true,
      },
    });

    if (cachedSubmission) {
      return NextResponse.json({
        success: true,
        cached: true,
        submission: cachedSubmission,
      });
    }

    // Parse test cases
    const testCases = (challenge.testInputs as any) || [{}];
    const testCase = (Array.isArray(testCases) ? testCases[0] : testCases) || {};
    const compiledPrompt = compilePrompt(promptText, testCase);

    const isLlamaSelected = (modelId || "").toLowerCase().includes("llama");
    const targetModelsToRun = crossModel
      ? [
          { provider: "Meta", name: "llama-3.3-70b" },
          { provider: "Google", name: "gemini-2.0-flash" },
        ]
      : [
          {
            provider: isLlamaSelected ? "Meta" : "Google",
            name: isLlamaSelected ? "llama-3.3-70b" : "gemini-2.0-flash",
          },
        ];

    // Call execution across requested target models in parallel
    const executions = await Promise.all(
      targetModelsToRun.map(async (m) => {
        const res = await callModel(
          m.provider,
          m.name,
          compiledPrompt,
          challenge.systemPrompt || undefined
        );
        logLLMTelemetry({
          provider: m.provider,
          model: m.name,
          latencyMs: res.executionTimeMs,
          tokenCount: res.tokenCount,
          success: !res.text.includes("[Evaluation Error]"),
        });
        return {
          ...m,
          ...res,
        };
      })
    );

    const primaryExecution = executions[0];

    // Call judge on primary model output
    const judgeGrades = await callJudge(
      criteria.map((c) => ({
        name: c.name,
        weight: c.weight,
        description: c.description,
      })),
      promptText,
      primaryExecution.text
    );

    let totalScore = 0;
    const finalScoresList = criteria.map((crit) => {
      const judgeScore = judgeGrades.criteria_scores.find(
        (s) => s.label.toLowerCase() === crit.name.toLowerCase()
      );
      const scoreValue = judgeScore ? judgeScore.score : 70;
      const passed = scoreValue >= 70;

      totalScore += scoreValue * (crit.weight / 100);

      return {
        criterionId: crit.id,
        score: scoreValue,
        passed,
        feedback: judgeScore?.justification || "Meets criteria requirements.",
      };
    });

    const isPassed = totalScore >= 70;

    // Save submission and all model test results
    const submission = await prisma.$transaction(async (tx) => {
      const createdSubmission = await tx.submission.create({
        data: {
          userId: finalUserId,
          challengeId: challenge.id,
          promptText: promptText.trim(),
          status: SubmissionStatus.COMPLETED,
          totalScore,
          passed: isPassed,
          tokenCount: primaryExecution.tokenCount,
          executionTime: primaryExecution.executionTimeMs,
        },
      });

      await tx.submissionScore.createMany({
        data: finalScoresList.map((item) => ({
          submissionId: createdSubmission.id,
          criterionId: item.criterionId,
          score: item.score,
          passed: item.passed,
          feedback: item.feedback,
        })),
      });

      await tx.modelTestResult.createMany({
        data: executions.map((exec) => ({
          submissionId: createdSubmission.id,
          modelProvider: exec.provider,
          modelName: exec.name,
          rawOutput: exec.text,
          latencyMs: exec.executionTimeMs,
          score: totalScore,
          passed: isPassed,
        })),
      });

      await tx.challenge.update({
        where: { id: challenge.id },
        data: {
          totalSubmissions: { increment: 1 },
        },
      });

      return createdSubmission;
    });

    // Re-fetch formatted result
    const fullSubmission = await prisma.submission.findUnique({
      where: { id: submission.id },
      include: {
        scores: {
          include: {
            criterion: true,
          },
        },
        modelTestResults: true,
      },
    });

    return NextResponse.json({
      success: true,
      cached: false,
      submission: fullSubmission,
    });
  } catch (error: any) {
    captureError(error, {
      tags: { route: "challenges/submit", challengeId: (await params)?.id },
      extra: { body },
    });
    return NextResponse.json(
      { error: error.message || "Failed to process submission grading" },
      { status: 500 }
    );
  }
}
