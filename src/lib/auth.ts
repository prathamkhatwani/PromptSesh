import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { findMockUserByEmail } from "@/lib/mock-data";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "dummy_github_id",
      clientSecret: process.env.GITHUB_SECRET || "dummy_github_secret",
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
          // Gracefully fall back to local mock Users store if database is offline
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

        // Demo fallback default account
        if (email === "engineer@promptsesh.com" && (password === "prompt123" || password === "password")) {
          return {
            id: "usr_demo_101",
            name: "Alex Rivera",
            email: "engineer@promptsesh.com",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            role: "USER",
          } as any;
        }

        return null;
      },
    }),
    Credentials({
      id: "demo",
      name: "Demo Engineer",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || "engineer@promptsesh.com";
        return {
          id: "usr_demo_101",
          name: "Alex Rivera (Demo Engineer)",
          email: email,
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          role: "USER",
        } as any;
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
          // Gracefully continue if DB offline during mock testing
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
