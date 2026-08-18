import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkDbConnection } from "@/lib/queries";
import crypto from "crypto";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = forgotPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || "Please provide a valid email address.";
      return NextResponse.json(
        { error: errorMessage, details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;
    const isDbConnected = await checkDbConnection();

    if (isDbConnected) {
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });

      if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: token,
            resetTokenExpiry: expiry,
          },
        });

        const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

        // TODO: Send email via transactional email service (Resend, SendGrid, etc.)
        // For development/debugging purposes only:
        if (process.env.NODE_ENV !== "production") {
          console.log(`[AUTH][DEV-ONLY] Password reset link for ${email}: ${resetUrl}`);
        }
      }
      // If user not found, do not reveal — return same generic success to prevent email enumeration
    }

    // Always return generic success message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent. Please check your inbox and spam folder.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
