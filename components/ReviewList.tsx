type Review = {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  authorName: string;
  createdAt: string;
};

type ReviewListProps = {
  reviews: Review[];
};

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <section
        aria-labelledby="reviews-heading"
        className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-8"
      >
        <header>
          <h2 id="reviews-heading" className="text-lg font-semibold text-neutral-900">
            Reviews
          </h2>
          <p className="text-sm text-neutral-600">
            This item is fresh in the catalog. Be the first to share your experience below.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="reviews-heading"
      className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8"
    >
      <header>
        <h2 id="reviews-heading" className="text-lg font-semibold text-neutral-900">
          Reviews
        </h2>
        <p className="text-sm text-neutral-600">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"} from the Claroche community.
        </p>
      </header>

      <ul className="space-y-6">
        {reviews.map((review) => {
          const createdAt = new Date(review.createdAt);
          return (
            <li key={review.id} className="space-y-2 rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <span aria-hidden="true">★</span>
                  <span className="sr-only">Rating:</span>
                  <span>{review.rating}/5</span>
                </div>
                <time className="text-xs text-neutral-500" dateTime={createdAt.toISOString()}>
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }).format(createdAt)}
                </time>
              </div>
              {review.title ? (
                <h3 className="text-sm font-medium text-neutral-900">{review.title}</h3>
              ) : null}
              <p className="text-sm text-neutral-600">{review.body}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {review.authorName}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
