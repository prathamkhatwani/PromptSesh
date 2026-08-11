import { getChallenges, getCategories } from "@/lib/queries";
import { ChallengeList } from "@/components/challenge/challenge-list";

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
