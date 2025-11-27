import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import {
  deleteAdminProduct,
  getAdminProductList,
  type ProductListFilters,
  type ProductSort,
} from "@/lib/admin/products";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Claroche Admin · Products",
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const sortOptions: Array<{ label: string; value: ProductSort }> = [
  { label: "Recently updated", value: "recent" },
  { label: "Alphabetical", value: "title" },
  { label: "Price ↑", value: "price-asc" },
  { label: "Price ↓", value: "price-desc" },
  { label: "Status", value: "status" },
];

export default async function AdminProductsPage(props: ProductsPageProps) {
  await requireAdminSession();

  const searchParams = await props.searchParams;
  const filters = toFilters(searchParams);
  const list = await getAdminProductList(filters);

  async function deleteProductAction(formData: FormData) {
    "use server";
    const session = await requireAdminSession();
    if (!session) {
      redirect("/admin/login");
    }

    const productId = formData.get("productId")?.toString();

    if (!productId) {
      throw new Error("Missing product id");
    }

    await deleteAdminProduct(productId);
    revalidatePath("/admin/products");
    revalidateTag("products");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Products</h1>
            <p className="text-sm text-neutral-600">
              Search, sort, and maintain the Claroche catalog.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">New product</Link>
          </Button>
        </header>

        <ProductFiltersBar filters={filters} totalItems={list.totalItems} />

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-sm text-neutral-700">
            <thead className="text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Variants</th>
                <th className="px-4 py-3">Reviews</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-neutral-500">
                    No products match the current filters.
                  </td>
                </tr>
              ) : null}
              {list.items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/products/${item.id}/edit`}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <span className="text-xs text-neutral-400">{item.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-neutral-200 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                      {item.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.variantsCount}</td>
                  <td className="px-4 py-3">{item.reviewsCount}</td>
                  <td className="px-4 py-3">${(item.price / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {item.updatedAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${item.id}/edit`}
                        className="text-xs font-semibold text-neutral-900 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="productId" value={item.id} />
                        <Button variant="outline" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {list.totalPages > 1 ? (
          <Pagination
            current={list.page}
            total={list.totalPages}
            searchParams={searchParams}
          />
        ) : null}
      </div>
    </section>
  );
}

function toFilters(searchParams?: Record<string, string | string[] | undefined>): ProductListFilters {
  const filters: ProductListFilters = {};
  if (!searchParams) return filters;

  const getValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value ?? undefined;
  };

  const search = getValue("q");
  const sortValue = getValue("sort");
  const statusValue = getValue("status");
  const pageValue = getValue("page");

  if (search) {
    filters.search = search;
  }

  if (sortValue && sortOptions.some((option) => option.value === sortValue)) {
    filters.sort = sortValue as ProductSort;
  }

  if (statusValue && statusValue !== "all") {
    filters.status = statusValue as ProductListFilters["status"];
  } else {
    filters.status = "all";
  }

  const page = Number.parseInt(pageValue ?? "1", 10);
  if (!Number.isNaN(page) && page > 0) {
    filters.page = page;
  }

  return filters;
}

function ProductFiltersBar({
  filters,
  totalItems,
}: {
  filters: ProductListFilters;
  totalItems: number;
}) {
  return (
    <form className="mt-6 grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-[1fr,auto,auto]">
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Search
        <input
          type="search"
          name="q"
          defaultValue={filters.search ?? ""}
          placeholder="Name or slug"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Sort
        <select
          name="sort"
          defaultValue={filters.sort ?? "recent"}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Status
        <select
          name="status"
          defaultValue={(filters.status ?? "all") as string}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        >
          <option value="all">All</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </label>
      <input type="hidden" name="page" value="1" />
      <div className="sm:col-span-3 flex items-center justify-between text-xs text-neutral-500">
        <span>{totalItems} products</span>
        <Button type="submit" size="sm">
          Apply
        </Button>
      </div>
    </form>
  );
}

function Pagination({
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

  return (
    <div className="mt-6 flex items-center justify-between text-sm text-neutral-600">
      <span>
        Page {current} of {total}
      </span>
      <div className="flex items-center gap-2">
        <PaginationLink disabled={!prev} page={prev} searchParams={searchParams}>
          Previous
        </PaginationLink>
        <PaginationLink disabled={!next} page={next} searchParams={searchParams}>
          Next
        </PaginationLink>
      </div>
    </div>
  );
}

function PaginationLink({
  disabled,
  page,
  children,
}: {
  disabled: boolean;
  page: number | null;
  children: React.ReactNode;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const pathname = "/admin/products";

  if (disabled || !page) {
    return (
      <span className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-400">
        {children}
      </span>
    );
  }

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
  const url = `${pathname}?${params.toString()}`;

  return (
    <Link
      href={url}
      className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
    >
      {children}
    </Link>
  );
}
