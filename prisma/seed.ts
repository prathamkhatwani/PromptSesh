import { PrismaClient, Difficulty } from "@prisma/client";
import { categories, challenges } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PromptSesh production database...");

  // 1. Seed Categories
  console.log("📦 Seeding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      },
    });
  }

  // 2. Seed Challenges, Rubrics, and Criteria
  console.log("🎯 Seeding challenges and rubrics...");
  for (const item of challenges) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });

    if (!category) {
      console.warn(`Category slug '${item.categorySlug}' not found for challenge '${item.title}'. Skipping.`);
      continue;
    }

    // Map difficulty string to enum
    let difficultyEnum: Difficulty = Difficulty.MEDIUM;
    const diffUpper = (item.difficulty || "").toUpperCase();
    if (diffUpper === "EASY") difficultyEnum = Difficulty.EASY;
    else if (diffUpper === "HARD") difficultyEnum = Difficulty.HARD;
    else if (diffUpper === "EXPERT") difficultyEnum = Difficulty.EXPERT;

    const challenge = await prisma.challenge.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        difficulty: difficultyEnum,
        categoryId: category.id,
        starterPrompt: item.starterPrompt || undefined,
        constraints: item.constraints ? item.constraints.join("\n") : undefined,
        hints: item.hints || [],
        isPublished: true,
      },
      create: {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        difficulty: difficultyEnum,
        categoryId: category.id,
        starterPrompt: item.starterPrompt || undefined,
        constraints: item.constraints ? item.constraints.join("\n") : undefined,
        hints: item.hints || [],
        isPublished: true,
      },
    });

    // Seed Rubric & RubricCriteria
    if (item.rubricCriteria && item.rubricCriteria.length > 0) {
      const rubric = await prisma.rubric.upsert({
        where: { challengeId: challenge.id },
        update: { name: `${item.title} Rubric` },
        create: {
          challengeId: challenge.id,
          name: `${item.title} Rubric`,
        },
      });

      await prisma.rubricCriterion.deleteMany({
        where: { rubricId: rubric.id },
      });

      for (const crit of item.rubricCriteria) {
        await prisma.rubricCriterion.create({
          data: {
            rubricId: rubric.id,
            name: crit.name,
            weight: crit.weight,
            description: crit.description,
            evaluationPrompt: `Evaluate response accuracy and quality against criterion: ${crit.name}`,
          },
        });
      }
    }
  }

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Database seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
