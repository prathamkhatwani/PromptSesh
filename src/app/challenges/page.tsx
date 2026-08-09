import { getChallenges, getCategories } from "@/lib/queries";
import { ChallengeList } from "@/components/challenge/challenge-list";

export default async function ChallengesPage() {
  const [challenges, categories] = await Promise.all([
    getChallenges(),
    getCategories(),
  ]);

  return (
    <ChallengeList
      initialChallenges={challenges as any}
      initialCategories={categories}
    />
  );
}
