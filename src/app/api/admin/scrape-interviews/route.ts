import { NextResponse } from "next/server";
import { fetchLiveInterviewQuestions, transformScrapedQuestionToChallenge } from "@/lib/scraper";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    // Strictly require authenticated ADMIN session — no email or dev bypass
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized — authentication required." }, { status: 401 });
    }

    const user = session.user as any;
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden — administrator privileges required." }, { status: 403 });
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
