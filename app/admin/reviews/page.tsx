import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import {
  approveReview,
  getAdminReviews,
  rejectReview,
  type ReviewFilters,
} from "@/lib/admin/reviews";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Claroche Admin · Reviews",
};

type ReviewsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminReviewsPage(props: ReviewsPageProps) {
  await requireAdminSession();

  const searchParams = await props.searchParams;
  const filters = toFilters(searchParams);
  const reviews = await getAdminReviews(filters);

  async function moderateReview(formData: FormData) {
    "use server";
    await requireAdminSession();

    const id = formData.get("reviewId")?.toString();
    const intent = formData.get("intent")?.toString();

    if (!id || !intent) {
      throw new Error("Missing review id or intent");
    }

    if (intent === "approve") {
      await approveReview(id);
    } else if (intent === "reject") {
      await rejectReview(id);
    }

    revalidatePath("/admin/reviews");
  }

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Reviews moderation</h1>
          <p className="text-sm text-neutral-600">
            Approve new testimonials or reject the ones that don’t align with Claroche guidelines.
          </p>
        </div>
      </header>

      <form className="grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-[1fr,auto,auto]">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Search
          <input
            type="search"
            name="q"
            defaultValue={filters.search ?? ""}
            placeholder="Name, email, copy"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Status
          <select name="status" defaultValue={filters.status ?? "all"} className={inputClass}>
            <option value="all">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button type="submit" size="sm">
            Apply
          </Button>
        </div>
        <input type="hidden" name="page" value="1" />
      </form>

      <div className="space-y-4">
        {reviews.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
            No reviews found for this filter.
          </div>
        ) : null}

        {reviews.items.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-full border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-600">
                  {review.rating} / 5
                </span>
                <span className="font-semibold text-neutral-900">{review.authorName}</span>
                {review.authorEmail ? (
                  <span className="text-xs text-neutral-400">{review.authorEmail}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>{review.createdAt.toLocaleDateString()}</span>
                <span className="rounded-full border border-neutral-200 px-2 py-1 uppercase tracking-wide text-neutral-500">
                  {review.status.toLowerCase()}
                </span>
              </div>
            </header>
            {review.title ? (
              <h3 className="mt-3 text-sm font-semibold text-neutral-900">{review.title}</h3>
            ) : null}
            <p className="mt-2 text-sm text-neutral-600">{review.body}</p>
            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
              <Link
                href={`/product/${review.productSlug}`}
                className="font-semibold text-neutral-900 hover:underline"
              >
                {review.productTitle}
              </Link>
              <div className="flex items-center gap-2">
                {review.status !== "APPROVED" ? (
                  <form action={moderateReview}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="intent" value="approve" />
                    <Button type="submit" size="sm" variant="outline">
                      Approve
                    </Button>
                  </form>
                ) : null}
                {review.status !== "REJECTED" ? (
                  <form action={moderateReview}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="intent" value="reject" />
                    <Button type="submit" size="sm" variant="outline">
                      Reject
                    </Button>
                  </form>
                ) : null}
              </div>
            </footer>
          </article>
        ))}
      </div>
      {reviews.totalPages > 1 ? (
        <ReviewsPagination
          current={reviews.page}
          total={reviews.totalPages}
          searchParams={searchParams}
        />
      ) : null}
    </section>
  );
}

function toFilters(searchParams?: Record<string, string | string[] | undefined>): ReviewFilters {
  const filters: ReviewFilters = {};
  if (!searchParams) return filters;

  const getValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value ?? undefined;
  };

  const search = getValue("q");
  const status = getValue("status");
  const page = getValue("page");

  if (search) {
    filters.search = search;
  }

  if (status) {
    filters.status = status as ReviewFilters["status"];
  } else {
    filters.status = "PENDING";
  }

  const pageNumber = Number.parseInt(page ?? "1", 10);
  if (!Number.isNaN(pageNumber)) {
    filters.page = pageNumber;
  }

  return filters;
}

const inputClass =
  "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

function ReviewsPagination({
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

  const makeHref = (page: number | null) => {
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
    return `/admin/reviews?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between text-sm text-neutral-600">
      <span>
        Page {current} of {total}
      </span>
      <div className="flex items-center gap-2">
        <LinkOrSpan disabled={!prev} href={makeHref(prev)}>
          Previous
        </LinkOrSpan>
        <LinkOrSpan disabled={!next} href={makeHref(next)}>
          Next
        </LinkOrSpan>
      </div>
    </div>
  );
}

function LinkOrSpan({
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
