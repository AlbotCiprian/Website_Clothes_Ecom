import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Claroche | Elevated Activewear",
  description:
    "Claroche oferă echipamente de antrenament cu design curat și funcțional pentru ritmul tău de zi cu zi."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={cn("bg-white text-neutral-900", urbanist.variable)}>
      <body className="flex min-h-screen flex-col font-sans">
        <a className="skip-link focus-ring" href="#main">
          Sari la conținut
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
