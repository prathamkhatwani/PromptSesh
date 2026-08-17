import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

function getMetadataBase(): URL {
  const envUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
  if (!envUrl) return new URL("https://promptsesh.com");
  try {
    const formatted = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    return new URL(formatted);
  } catch {
    return new URL("https://promptsesh.com");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
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
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-dark-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200`}>
        <AuthSessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
