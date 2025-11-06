import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Claroche | Elevated Activewear",
    template: "%s · Claroche",
  },
  description:
    "Claroche crafts elevated activewear with clean lines, premium fabrics, and movement-first tailoring.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Claroche | Elevated Activewear",
    description:
      "Claroche crafts elevated activewear with clean lines, premium fabrics, and movement-first tailoring.",
    url: siteUrl,
    siteName: "Claroche",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claroche | Elevated Activewear",
    description:
      "Claroche crafts elevated activewear with clean lines, premium fabrics, and movement-first tailoring.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("bg-white text-neutral-900", urbanist.variable)}>
      <body className="flex min-h-screen flex-col font-sans">
        <a className="skip-link focus-ring" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
