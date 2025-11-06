import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";

import LinkGeneratorForm, {
  type LinkGeneratorProduct,
} from "@/components/admin/LinkGeneratorForm";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/auth";
import { createAdminLink, getAdminLinks, type LinkFilters } from "@/lib/admin/links";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Claroche Admin · Links",
};

type LinksPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AdminLinksPage({ searchParams }: LinksPageProps) {
  await requireAdminSession();

  const filters = toFilters(searchParams);
  const [links, products] = await Promise.all([
    getAdminLinks(filters),
    prisma.product.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        variants: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  const productOptions: LinkGeneratorProduct[] = products.map((product) => ({
    id: product.id,
    title: product.title,
    slug: product.slug,
    variants: product.variants,
  }));

  async function createLinkAction(formData: FormData) {
    "use server";
    await requireAdminSession();

    const productId = formData.get("productId")?.toString();
    const variantId = formData.get("variantId")?.toString() || undefined;
    const label = formData.get("label")?.toString();
    const medium = formData.get("medium")?.toString() || undefined;
    const target = formData.get("target")?.toString() as "PDP" | "ADD_TO_CART" | undefined;
    const redirect = formData.get("redirect")?.toString() || undefined;

    if (!productId || !label || !target) {
      throw new Error("Missing required fields");
    }

    await createAdminLink({
      productId,
      variantId,
      label,
      medium,
      target,
      redirectTo: redirect && redirect !== "none" ? redirect : null,
    });

    revalidatePath("/admin/links");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Campaign links</h1>
            <p className="text-sm text-neutral-600">
              Generate PDP or add-to-cart experiences with short tracking codes.
            </p>
          </div>
        </header>

        <LinkGeneratorForm products={productOptions} action={createLinkAction} />

        <SearchBar filters={filters} />

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-sm text-neutral-700">
            <thead className="text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Medium</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Hits</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {links.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-neutral-500">
                    No links generated yet.
                  </td>
                </tr>
              ) : null}
              {links.items.map((link) => (
                <tr key={link.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="rounded-full border border-neutral-200 px-2 py-1 text-neutral-700">
                      {link.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-900">{link.label}</span>
                      <Link
                        href={link.url}
                        className="break-all text-xs text-neutral-400 hover:underline"
                      >
                        {link.url}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wide text-neutral-500">
                    {link.target}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {link.medium ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-xs">
                      <Link
                        href={`/product/${link.productSlug}`}
                        className="font-semibold text-neutral-900 hover:underline"
                      >
                        {link.productTitle}
                      </Link>
                      {link.variantName ? (
                        <span className="text-neutral-500">{link.variantName}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">{link.hits}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {link.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {links.totalPages > 1 ? (
          <LinksPagination current={links.page} total={links.totalPages} searchParams={searchParams} />
        ) : null}
      </div>
    </section>
  );
}

function toFilters(searchParams?: Record<string, string | string[] | undefined>): LinkFilters {
  const filters: LinkFilters = {};
  if (!searchParams) return filters;

  const getValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value ?? undefined;
  };

  const search = getValue("q");
  const page = getValue("page");

  if (search) {
    filters.search = search;
  }

  const pageNumber = Number.parseInt(page ?? "1", 10);
  if (!Number.isNaN(pageNumber)) {
    filters.page = pageNumber;
  }

  return filters;
}

function SearchBar({ filters }: { filters: LinkFilters }) {
  return (
    <form className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-end sm:justify-between">
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Search
        <input
          type="search"
          name="q"
          defaultValue={filters.search ?? ""}
          placeholder="Code, label or medium"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
      </label>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">
          Filter
        </Button>
      </div>
    </form>
  );
}

function LinksPagination({
  current,
  total,
  searchParams,
}: {
  current: number;
  total: number;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const prev = current > 1 ? current - 1 : null;
  const next = current < total ? current + 1 : null;

  const buildUrl = (page: number | null) => {
    if (!page) return "#";
    const params = new URLSearchParams();
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (key === "page") continue;
        if (Array.isArray(value)) {
          value.filter(Boolean).forEach((entry) => params.append(key, entry));
        } else if (value) {
          params.set(key, value);
        }
      }
    }
    params.set("page", String(page));
    return `/admin/links?${params.toString()}`;
  };

  return (
    <div className="mt-6 flex items-center justify-between text-sm text-neutral-600">
      <span>
        Page {current} of {total}
      </span>
      <div className="flex items-center gap-2">
        <PaginationLink disabled={!prev} href={buildUrl(prev)}>
          Previous
        </PaginationLink>
        <PaginationLink disabled={!next} href={buildUrl(next)}>
          Next
        </PaginationLink>
      </div>
    </div>
  );
}

function PaginationLink({
  disabled,
  href,
  children,
}: {
  disabled: boolean;
  href: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-400">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
    >
      {children}
    </Link>
  );
}
