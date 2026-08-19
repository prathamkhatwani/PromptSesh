import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { findMockUserByEmail } from "@/lib/mock-data";

const rawGithubId = (process.env.GITHUB_ID || "").replace(/^["']|["']$/g, "").trim();
const rawGithubSecret = (process.env.GITHUB_SECRET || "").replace(/^["']|["']$/g, "").trim();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: (() => {
    const s = (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "").replace(/^["']|["']$/g, "").trim();
    if (!s && process.env.NODE_ENV === "production") {
      throw new Error("[FATAL] NEXTAUTH_SECRET or AUTH_SECRET must be set in production. Refusing to start with an insecure default.");
    }
    return s || "dev-only-insecure-secret-do-not-use-in-prod";
  })(),
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: rawGithubId || "dummy_github_id",
      clientSecret: rawGithubSecret || "dummy_github_secret",
    }),
    Credentials({
      id: "credentials",
      name: "PromptSesh Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string || "").toLowerCase().trim();
        const password = credentials?.password as string;

        if (!email || !password) {
          return null;
        }

        const bcrypt = await import("bcryptjs");

        // 1. Check PostgreSQL Database if reachable
        try {
          const user = await prisma.user.findFirst({
            where: { email: { equals: email } },
          });

          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (isValid) {
              return {
                id: user.id,
                name: user.name || "Prompt Engineer",
                email: user.email!,
                image: user.image || undefined,
                role: user.role || "USER",
              } as any;
            }
            return null;
          }
        } catch (err) {
          console.warn("[AUTH] Database lookup failed, falling back to mock store:", (err as Error).message);
        }

        // 2. Check Local/Mock Users store (dev & offline mode)
        const mockUser = findMockUserByEmail(email);
        if (mockUser && mockUser.passwordHash) {
          const isValid = await bcrypt.compare(password, mockUser.passwordHash);
          if (isValid) {
            return {
              id: mockUser.id,
              name: mockUser.name,
              email: mockUser.email,
              image: mockUser.image,
              role: mockUser.role || "USER",
            } as any;
          }
          return null;
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user }) {
      if (user && user.id) {
        try {
          const streak = await prisma.streak.findFirst({
            where: { userId: user.id },
          });
          if (!streak) {
            await prisma.streak.create({
              data: {
                userId: user.id,
                currentStreak: 1,
                longestStreak: 1,
                lastActiveAt: new Date(),
              },
            });
          }
        } catch (e) {
          console.warn("[AUTH] Streak creation failed (DB may be offline):", (e as Error).message);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).role = (token as any).role || "USER";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        (token as any).role = (user as any).role || "USER";
      }
      return token;
    },
  },
});
