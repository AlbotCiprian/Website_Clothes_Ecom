import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/header";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "swiftpay-link | Checkout by link",
  description:
    "Create shareable checkout links that preconfigure carts for your customers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${urbanist.variable} bg-[var(--background)] text-neutral-900 antialiased`}>
        <Header />
        <main className="pb-16 pt-6">{children}</main>
      </body>
    </html>
  );
}
