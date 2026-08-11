import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "dummy_github_id",
      clientSecret: process.env.GITHUB_SECRET || "dummy_github_secret",
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
        };
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
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
