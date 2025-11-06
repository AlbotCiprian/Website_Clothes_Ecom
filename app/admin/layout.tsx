import type { ReactNode } from "react";

import AdminNav from "@/components/admin/AdminNav";
import { getServerAuthSession, isAdmin } from "@/lib/auth";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerAuthSession();
  const admin = isAdmin(session);

  return (
    <div className="min-h-screen bg-neutral-100">
      {admin ? <AdminNav userEmail={session?.user?.email} /> : null}
      <div
        className={
          admin
            ? "mx-auto max-w-6xl px-6 py-10"
            : "flex items-center justify-center px-6 py-16"
        }
      >
        <div className={admin ? "w-full" : "w-full max-w-md"}>
          {children}
        </div>
      </div>
    </div>
  );
}
