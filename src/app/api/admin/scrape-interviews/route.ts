import { NextResponse } from "next/server";
import { fetchLiveInterviewQuestions, transformScrapedQuestionToChallenge } from "@/lib/scraper";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    const user = session?.user as any;
    const isDev = process.env.NODE_ENV === "development";
    const isAdmin = user?.role === "ADMIN" || user?.email === "admin@promptcode.com" || user?.email === "admin@promptsesh.com";

    if (!isDev && (!session || !isAdmin)) {
      return NextResponse.json({ error: "Unauthorized. Administrator privileges required." }, { status: 403 });
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
