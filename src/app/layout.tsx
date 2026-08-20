import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://promptsesh.com"),
  title: "PromptSesh — Master Prompt Engineering",
  description:
    "The #1 practice platform for prompt engineering. Solve challenges, get AI-graded feedback, and prove your skills across LLMs.",
  keywords: [
    "prompt engineering",
    "LLM",
    "AI",
    "practice",
    "challenges",
    "grading",
    "interview prep",
  ],
  openGraph: {
    title: "PromptSesh — Master Prompt Engineering",
    description: "The #1 practice platform for prompt engineering. Solve challenges & simulate AI interviews.",
    siteName: "PromptSesh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptSesh — Master Prompt Engineering",
    description: "The #1 practice platform for prompt engineering.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <AuthSessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
