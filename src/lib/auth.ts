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
      id: "credentials",
      name: "PromptSesh Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          throw new Error("Please enter both email and password.");
        }

        try {
          const bcrypt = await import("bcryptjs");
          const user = await prisma.user.findFirst({
            where: { email: { equals: email.toLowerCase().trim() } },
          });

          if (user && user.passwordHash) {
            const isValid = bcrypt.compareSync(password, user.passwordHash);
            if (!isValid) {
              throw new Error("Invalid password. Please check your credentials.");
            }
            return {
              id: user.id,
              name: user.name || "Prompt Engineer",
              email: user.email!,
              image: user.image || undefined,
            };
          }

          if (user && !user.passwordHash) {
            throw new Error("This account was created with GitHub. Please sign in with GitHub.");
          }
        } catch (err: any) {
          if (err.message && !err.message.includes("prisma")) {
            throw err;
          }
        }

        // Mock fallback account if database offline or initial setup
        if (email.toLowerCase().trim() === "engineer@promptsesh.com" && password === "prompt123") {
          return {
            id: "usr_demo_101",
            name: "Alex Rivera",
            email: "engineer@promptsesh.com",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          };
        }

        throw new Error("No account found with this email. Please click 'Create Account' to sign up!");
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
