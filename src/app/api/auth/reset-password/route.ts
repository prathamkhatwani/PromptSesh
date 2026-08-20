import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkDbConnection } from "@/lib/queries";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Reset token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const isDbConnected = await checkDbConnection();

    if (isDbConnected) {
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

      const passwordHash = bcrypt.hashSync(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset! You can now sign in.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
