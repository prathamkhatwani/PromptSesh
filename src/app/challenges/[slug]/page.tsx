import { getChallengeBySlug } from "@/lib/queries";
import { ChallengeWorkspace } from "@/components/challenge/challenge-workspace";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await getChallengeBySlug(slug);
  if (!challenge) return { title: "Challenge Not Found" };

  return {
    title: `${challenge.title} — PromptSesh`,
    description: `${challenge.difficulty} prompt engineering challenge: ${challenge.description?.slice(0, 140)}`,
    openGraph: {
      title: `${challenge.title} — PromptSesh`,
      description: `Solve this ${challenge.difficulty} ${challenge.category} challenge on PromptSesh.`,
    },
  };
}

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
