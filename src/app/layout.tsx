import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
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
  title: "PROMPTSESH — SWISS MONOCHROME BENCHMARK",
  description:
    "The deterministic evaluation platform for prompt engineering. Test across dual foundation models with strict rubric telemetry.",
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
      className={`dark ${plusJakartaSans.variable} ${geistMono.variable}`}
    >
      <body
        className={`${plusJakartaSans.className} min-h-screen flex flex-col antialiased bg-[#000000] text-white selection:bg-white selection:text-black`}
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
