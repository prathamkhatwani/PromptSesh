import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Allow creation in dev environment or if user is ADMIN
    const isDev = process.env.NODE_ENV === "development";
    const user = session?.user as any;
    const isAdmin = user?.role === "ADMIN" || user?.email === "admin@promptcode.com";

    if (!isDev && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
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
    } = body;

    if (!title || !slug || !description || !difficulty || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, description, difficulty, categoryId" },
        { status: 400 }
      );
    }

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
          data: rubricCriteria.map((crit: any, idx: number) => ({
            rubricId: rubric.id,
            name: crit.name,
            description: crit.description,
            weight: parseFloat(crit.weight),
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
