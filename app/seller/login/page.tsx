import type { Metadata } from "next";
import { redirect } from "next/navigation";

import LoginForm from "@/components/admin/LoginForm";
import { getServerAuthSession, isSeller } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Claroche Seller Portal — Sign in",
  description: "Access your Claroche seller workspace to manage catalog entries and orders.",
};

export default async function SellerLoginPage() {
  const session = await getServerAuthSession();

  if (isSeller(session)) {
    redirect("/seller/dashboard");
  }

  return (
    <section className="space-y-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
          Seller Workspace
        </p>
        <h1 className="text-2xl font-semibold text-neutral-900">Welcome back</h1>
        <p className="text-sm text-neutral-600">
          Use the email and password you registered with to manage your storefront.
        </p>
      </div>
      <LoginForm
        defaultRedirect="/seller/dashboard"
        helperText='Demo seller account:<br/><span class="font-medium text-neutral-900">seller@atelierclaroche.shop</span> / <span class="font-medium text-neutral-900">Seller#12345!</span>'
      />
      <p className="text-center text-xs text-neutral-500">
        Need access?{" "}
        <a href="/seller/apply" className="font-semibold text-neutral-900 underline-offset-4 hover:underline">
          Apply to become a Claroche seller
        </a>
        .
      </p>
    </section>
  );
}
