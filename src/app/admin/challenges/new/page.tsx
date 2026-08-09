import { getCategories } from "@/lib/queries";
import { ChallengeForm } from "@/components/admin/challenge-form";

export default async function NewChallengePage() {
  const categories = await getCategories();

  const formattedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  return <ChallengeForm categories={formattedCategories} />;
}
