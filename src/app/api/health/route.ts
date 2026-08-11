import { NextResponse } from "next/server";
import { checkDbConnection } from "@/lib/queries";

export async function GET() {
  const dbConnected = await checkDbConnection();

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "fallback_mock",
      environment: process.env.NODE_ENV || "development",
    },
    { status: 200 }
  );
}
