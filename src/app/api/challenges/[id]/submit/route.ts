import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { compilePrompt, callModel, callJudge } from "@/lib/llm";
import { SubmissionStatus } from "@prisma/client";
import * as mock from "@/lib/mock-data";
import { checkDbConnection } from "@/lib/queries";

import { checkRateLimit } from "@/lib/rate-limit";

function formatConstraints(constraints: unknown): string | undefined {
  if (!constraints) return undefined;
  if (Array.isArray(constraints)) return constraints.join("\n");
  if (typeof constraints === "string") return constraints;
  try {
    const parsed = typeof constraints === "object" ? constraints : JSON.parse(String(constraints));
    if (Array.isArray(parsed)) return parsed.join("\n");
  } catch {
    // fallback
  }
  return String(constraints);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    const rateLimitResult = await checkRateLimit(ip, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can make up to 10 prompt evaluations per minute." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { promptText, modelId = "gemini", crossModel = false } = body;

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

      // Model execution call
      const modelExecution = await callModel(
        "OpenRouter",
        modelId,
        compiledPrompt,
        formatConstraints(mockChallenge.constraints)
      );

      // Call judge evaluation (uses mock heuristic when API key is missing)
      const judgeGrades = await callJudge(
        mockChallenge.rubricCriteria,
        promptText,
        modelExecution.text,
        modelId
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
        tokenCount: modelExecution.tokenCount,
        executionTime: modelExecution.executionTimeMs,
        scores: mockScoresList,
        modelTestResults: [
          {
            id: "mock-res-id",
            submissionId: "mock-sub-id",
            modelProvider: "Google",
            modelName: "gemini-2.5-flash",
            rawOutput: modelExecution.text,
            latencyMs: modelExecution.executionTimeMs,
            score: totalScore,
            passed: totalScore >= 70,
          },
        ],
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
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const finalUserId = userId || "dev-user-id";

    // Guarantee dev user exists in database
    if (!userId && process.env.NODE_ENV !== "production") {
      await prisma.user.upsert({
        where: { id: finalUserId },
        update: {},
        create: {
          id: finalUserId,
          name: "Developer",
          email: "dev@promptsesh.dev",
        },
      });
    }

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
    // Parse test cases
    const testCases: Record<string, string>[] = (challenge.testInputs as any) || [{}];
    const testCase = testCases[0] || {};
    const compiledPrompt = compilePrompt(promptText, testCase);

    // Call execution
    const modelExecution = await callModel(
      "OpenRouter",
      modelId,
      compiledPrompt,
      formatConstraints(challenge.constraints)
    );

    // Call judge
    const judgeGrades = await callJudge(
      criteria.map((c) => ({
        name: c.name,
        weight: c.weight,
        description: c.description,
      })),
      promptText,
      modelExecution.text,
      modelId
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

    // Save
    const submission = await prisma.$transaction(async (tx) => {
      const createdSubmission = await tx.submission.create({
        data: {
          userId: finalUserId,
          challengeId: challenge.id,
          promptText: promptText.trim(),
          status: SubmissionStatus.COMPLETED,
          totalScore,
          passed: isPassed,
          tokenCount: modelExecution.tokenCount,
          executionTime: modelExecution.executionTimeMs,
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

      await tx.modelTestResult.create({
        data: {
          submissionId: createdSubmission.id,
          modelProvider: modelId.includes("gemini") ? "Google" : modelId.includes("llama") ? "Meta" : modelId.includes("glm") ? "Z.ai" : "Moonshot",
          modelName: modelId,
          rawOutput: modelExecution.text,
          latencyMs: modelExecution.executionTimeMs,
          score: totalScore,
          passed: isPassed,
        },
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
    console.error("Submission grading pipeline error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process submission grading" },
      { status: 500 }
    );
  }
}
