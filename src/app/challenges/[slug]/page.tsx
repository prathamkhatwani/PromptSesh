import { getChallengeBySlug } from "@/lib/queries";
import { ChallengeWorkspace } from "@/components/challenge/challenge-workspace";
import { notFound } from "next/navigation";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const challenge = await getChallengeBySlug(slug);
  if (!challenge) notFound();
  
  return <ChallengeWorkspace challenge={challenge as any} />;
}
