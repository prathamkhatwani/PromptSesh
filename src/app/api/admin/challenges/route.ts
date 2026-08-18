import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";
import { createChallengeSchema } from "@/lib/validations/challenge";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Strictly require authenticated ADMIN session — no email or dev bypass
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized — authentication required" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden — administrator privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = createChallengeSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || "Invalid challenge configuration.";
      return NextResponse.json({ error: errorMessage, details: parseResult.error.issues }, { status: 400 });
    }

    const {
      title,
      slug,
      description,
      difficulty,
      categoryId,
      systemPrompt,
      starterPrompt,
      testInputs,
      constraints,
      hints,
      isPremium,
      rubricCriteria,
    } = parseResult.data;

    // Wrap in Prisma transaction to ensure atomicity
    const challenge = await prisma.$transaction(async (tx) => {
      const createdChallenge = await tx.challenge.create({
        data: {
          title,
          slug,
          description,
          difficulty: difficulty as Difficulty,
          categoryId,
          systemPrompt: systemPrompt || null,
          starterPrompt: starterPrompt || null,
          testInputs: testInputs || [],
          constraints: constraints || "",
          hints: hints || [],
          isPublished: true,
          isPremium: !!isPremium,
        },
      });

      const rubric = await tx.rubric.create({
        data: {
          challengeId: createdChallenge.id,
          name: `${title} Rubric`,
        },
      });

      if (rubricCriteria && rubricCriteria.length > 0) {
        await tx.rubricCriterion.createMany({
          data: rubricCriteria.map((crit, idx) => ({
            rubricId: rubric.id,
            name: crit.name,
            description: crit.description,
            weight: crit.weight,
            maxScore: 100,
            evaluationPrompt: `Evaluate the submission based on the criterion "${crit.name}": ${crit.description}. Score from 0 to 100.`,
            sortOrder: idx,
          })),
        });
      }

      return createdChallenge;
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error: any) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create challenge" },
      { status: 500 }
    );
  }
}
