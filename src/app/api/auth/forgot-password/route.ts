import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkDbConnection } from "@/lib/queries";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    const trimmedEmail = (email || "").toLowerCase().trim();

    if (!trimmedEmail) {
      return NextResponse.json(
        { error: "Please enter your account email address." },
        { status: 400 }
      );
    }

    const isDbConnected = await checkDbConnection();
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    if (isDbConnected) {
      const user = await prisma.user.findFirst({
        where: { email: { equals: trimmedEmail } },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: token,
            resetTokenExpiry: expiry,
          },
        });
      }
    }

    // Return friendly success message with test URL link
    const resetUrl = `/auth/reset-password?token=${token}&email=${encodeURIComponent(trimmedEmail)}`;

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been generated.",
      resetUrl, // Dev convenience URL for testing
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to request password reset." },
      { status: 500 }
    );
  }
}
