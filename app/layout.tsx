import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Divyarith Shivashok — Software Engineer • AI • Robotics • Systems",
  description:
    "Interactive portfolio of Divyarith “Rith” Shivashok, a Computer Science student at UMass Amherst building intelligent systems that move, learn, and scale.",
  keywords: ["Divyarith Shivashok", "Rith Shivashok", "software engineer", "robotics", "LLM", "UMass Amherst"],
  authors: [{ name: "Divyarith Shivashok" }],
  openGraph: {
    title: "Divyarith Shivashok",
    description: "Building intelligent systems that move, learn, and scale.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${grotesk.variable}`}>
      <body className="bg-ink text-bone antialiased">{children}</body>
    </html>
  );
}
