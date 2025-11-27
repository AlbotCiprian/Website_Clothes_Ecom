import type { ReactNode } from "react";

import SellerNav from "@/components/seller/SellerNav";
import { requireSellerSession } from "@/lib/auth";

type SellerLayoutProps = {
  children: ReactNode;
};

export default async function SellerLayout({ children }: SellerLayoutProps) {
  const { session, seller } = await requireSellerSession();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SellerNav seller={seller} userEmail={session.user?.email} />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
