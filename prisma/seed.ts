import { PrismaClient, Difficulty } from "@prisma/client";
import { categories, challenges } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing records in reverse order of foreign keys
  console.log("Cleaning old database records...");
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.streak.deleteMany({});
  await prisma.modelTestResult.deleteMany({});
  await prisma.submissionScore.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.rubricCriterion.deleteMany({});
  await prisma.rubric.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Seed Categories
  console.log("Seeding categories...");
  const categoryMap: Record<string, string> = {}; // slug -> id

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        sortOrder: i,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        sortOrder: i,
      },
    });
    categoryMap[cat.slug] = createdCat.id;
  }
  console.log(`Successfully seeded ${categories.length} categories.`);

  // 3. Seed Challenges & Rubrics
  console.log("Seeding challenges and rubrics...");
  for (let i = 0; i < challenges.length; i++) {
    const ch = challenges[i];
    const categoryId = categoryMap[ch.categorySlug];

    if (!categoryId) {
      console.warn(`Category not found for slug: ${ch.categorySlug}. Skipping challenge: ${ch.title}`);
      continue;
    }

    // Map difficulty casing to enum Difficulty
    let dbDifficulty: Difficulty = Difficulty.EASY;
    switch (ch.difficulty.toUpperCase()) {
      case "EASY":
        dbDifficulty = Difficulty.EASY;
        break;
      case "MEDIUM":
        dbDifficulty = Difficulty.MEDIUM;
        break;
      case "HARD":
        dbDifficulty = Difficulty.HARD;
        break;
      case "EXPERT":
        dbDifficulty = Difficulty.EXPERT;
        break;
    }

    // Create the Challenge
    const createdChallenge = await prisma.challenge.create({
      data: {
        title: ch.title,
        slug: ch.slug,
        description: ch.fullDescription || ch.description,
        difficulty: dbDifficulty,
        categoryId: categoryId,
        starterPrompt: ch.starterPrompt || "",
        testInputs: ch.testInputs as any,
        constraints: ch.constraints ? ch.constraints.join("\n") : "",
        hints: ch.hints || [],
        isPublished: true,
        isPremium: ch.isPremium ?? false,
        acceptanceRate: ch.acceptanceRate,
        totalSubmissions: ch.totalSubmissions,
        sortOrder: i,
      },
    });

    // Create the Rubric for the challenge
    const createdRubric = await prisma.rubric.create({
      data: {
        challengeId: createdChallenge.id,
        name: `${ch.title} Rubric`,
        description: `Official grading rubric for ${ch.title}`,
      },
    });

    // Create RubricCriteria
    for (let j = 0; j < ch.rubricCriteria.length; j++) {
      const crit = ch.rubricCriteria[j];
      await prisma.rubricCriterion.create({
        data: {
          rubricId: createdRubric.id,
          name: crit.name,
          description: crit.description,
          weight: crit.weight,
          maxScore: 100,
          evaluationPrompt: `Evaluate the submission based on the criterion "${crit.name}": ${crit.description}. Score from 0 to 100.`,
          sortOrder: j,
        },
      });
    }
  }

  console.log(`Successfully seeded ${challenges.length} challenges with rubrics.`);
  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
