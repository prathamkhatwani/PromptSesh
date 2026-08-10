import { NextResponse } from "next/server";
import { fetchLiveInterviewQuestions, transformScrapedQuestionToChallenge } from "@/lib/scraper";

export async function POST() {
  try {
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
