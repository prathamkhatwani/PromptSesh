import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkDbConnection } from "@/lib/queries";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = resetPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || "Invalid reset details provided.";
      return NextResponse.json(
        { error: errorMessage, details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { token, newPassword } = parseResult.data;
    const isDbConnected = await checkDbConnection();

    if (!isDbConnected) {
      return NextResponse.json(
        { error: "Password reset is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash with 12 rounds and invalidate the resetToken immediately
    const passwordHash = bcrypt.hashSync(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset! You can now sign in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
