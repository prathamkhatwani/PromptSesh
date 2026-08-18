import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkDbConnection } from "@/lib/queries";
import { findMockUserByEmail, createMockUser } from "@/lib/mock-data";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = signupSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || "Invalid registration details.";
      return NextResponse.json(
        { error: errorMessage, details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;
    const trimmedName = name || "Prompt Engineer";
    const trimmedEmail = email;

    const isDbConnected = await checkDbConnection();

    if (isDbConnected) {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: { email: { equals: trimmedEmail, mode: "insensitive" } },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please sign in." },
          { status: 400 }
        );
      }

      // Hash password & create user
      const passwordHash = bcrypt.hashSync(password, 12);

      const newUser = await prisma.user.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          passwordHash,
          image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName || trimmedEmail)}`,
        },
      });

      // Initialize user streak
      try {
        await prisma.streak.create({
          data: {
            userId: newUser.id,
            currentStreak: 1,
            longestStreak: 1,
            lastActiveAt: new Date(),
          },
        });
      } catch (e) {
        console.warn("[AUTH] Streak initialization skipped:", (e as Error).message);
      }

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }

    // Mock fallback mode if database is offline
    const existingMockUser = findMockUserByEmail(trimmedEmail);
    if (existingMockUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const mockUser = createMockUser({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
