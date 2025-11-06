import type { Metadata } from "next";
import { redirect } from "next/navigation";

import LoginForm from "@/components/admin/LoginForm";
import { getServerAuthSession, isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Claroche Admin · Sign in",
  description: "Sign in to manage the Claroche catalog, reviews, and campaign links.",
};

export default async function AdminLoginPage() {
  const session = await getServerAuthSession();

  if (isAdmin(session)) {
    redirect("/admin/dashboard");
  }

  return (
    <section className="space-y-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
          Claroche Admin
        </p>
        <h1 className="text-2xl font-semibold text-neutral-900">Welcome back</h1>
        <p className="text-sm text-neutral-600">
          Use your Claroche credentials to access the control room.
        </p>
      </div>
      <LoginForm />
    </section>
  );
}
