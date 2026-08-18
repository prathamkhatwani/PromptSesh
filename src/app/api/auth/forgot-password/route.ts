import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkDbConnection } from "@/lib/queries";
import crypto from "crypto";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/email";

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
    let devPreviewUrl: string | false | undefined = undefined;

    if (isDbConnected) {
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });

      if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 3600000); // 1 hour validity

        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: token,
            resetTokenExpiry: expiry,
          },
        });

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

        // Dispatch email via Resend / SMTP / Ethereal Dev Transport
        try {
          const emailResult = await sendPasswordResetEmail({
            to: email,
            resetUrl,
          });
          if (emailResult.previewUrl) {
            devPreviewUrl = emailResult.previewUrl;
          }
        } catch (emailErr) {
          console.error("[AUTH] Failed to send password reset email:", emailErr);
        }
      } else {
        console.log(`[AUTH] Password reset requested for unregistered email: ${email}`);
      }
    }

    // Return generic success message to prevent user enumeration
    const responsePayload: { success: boolean; message: string; devPreviewUrl?: string } = {
      success: true,
      message: "If an account with that email exists, a password reset link has been sent. Please check your inbox and spam folder.",
    };

    // In local development, attach ethereal preview link if available
    if (process.env.NODE_ENV !== "production" && devPreviewUrl) {
      responsePayload.devPreviewUrl = devPreviewUrl;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
