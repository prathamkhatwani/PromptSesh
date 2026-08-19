import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
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
  title: "PromptSesh — Developer Platform for Prompt Engineering",
  description:
    "The deterministic workbench for prompt engineering. Solve challenges, run parallel evaluations across Llama 3.3 70B & Gemini 2.0 Flash, and inspect rubric scorecards.",
  keywords: [
    "prompt engineering",
    "LLM evaluation",
    "AI benchmarks",
    "developer tools",
    "rubrics",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        className={`${geistSans.className} min-h-screen flex flex-col antialiased bg-[#09090b] text-zinc-100 selection:bg-indigo-600 selection:text-white`}
      >
        <AuthSessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
