import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Big_Shoulders({
  subsets: ["latin"],
  weight: ["600", "800", "900"],
  variable: "--font-display",
  adjustFontFallback: false,
});
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Federico Fenoglio — Industrial Designer & Lead Strategist",
  description:
    "Industrial designer and lead strategist specialising in advanced surfacing and AI-driven design workflows. Based in London.",
  openGraph: {
    title: "Federico Fenoglio — Industrial Designer & Lead Strategist",
    description: "Advanced surfacing. Modern design workflows. Products that improve quality of life.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0a0b0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
