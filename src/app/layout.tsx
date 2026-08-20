import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
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
  title: "PromptSesh — Deterministic Prompt Engineering",
  description:
    "The deterministic developer platform for prompt engineering. Solve challenges, evaluate across dual LLMs, and review structured rubric evaluations.",
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
      className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className={`${spaceGrotesk.className} min-h-screen flex flex-col antialiased`}
        style={{ backgroundColor: 'var(--canvas-base)', color: 'var(--text-primary)' }}
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
