import { getChallenges, getCategories } from "@/lib/queries";
import { ChallengeList } from "@/components/challenge/challenge-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenges — PromptSesh",
  description: "Browse and solve prompt engineering challenges across 10 skill categories. Filter by difficulty, search by keyword, and master AI prompting.",
};

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialCategory = typeof params.category === "string" ? params.category : undefined;

  const [challenges, categories] = await Promise.all([
    getChallenges(),
    getCategories(),
  ]);

  return (
    <ChallengeList
      initialChallenges={challenges as any}
      initialCategories={categories}
      initialCategoryFilter={initialCategory}
    />
  );
}
