import { NextResponse } from "next/server";
import { fetchLiveInterviewQuestions, transformScrapedQuestionToChallenge } from "@/lib/scraper";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guard";

export async function POST() {
  try {
    const session = await auth();
    const authError = requireAdmin(session);
    if (authError) {
      return authError;
    }

    const rawQuestions = await fetchLiveInterviewQuestions();
    const newChallenges = rawQuestions.map((q, index) =>
      transformScrapedQuestionToChallenge(q, index + 100)
    );

    return NextResponse.json({
      message: `Successfully scraped ${newChallenges.length} interview questions from developer career sources.`,
      scrapedCount: newChallenges.length,
      challenges: newChallenges,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to scrape interview questions", details: error?.message },
      { status: 500 }
    );
  }
}
