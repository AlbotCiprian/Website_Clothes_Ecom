"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminNavProps = {
  userEmail?: string | null;
};

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/links", label: "Links" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/admin/dashboard" className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-900">
          Claroche Admin
        </Link>
        <nav className="flex items-center gap-3 text-sm text-neutral-600">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1 transition",
                  active
                    ? "bg-neutral-900 text-white"
                    : "hover:bg-neutral-900/5 hover:text-neutral-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          {userEmail ? <span className="hidden sm:inline">{userEmail}</span> : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
