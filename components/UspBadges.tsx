const BADGES = [
  {
    title: "Tailored for movement",
    description: "Four-way stretch fabrics engineered to flex without losing structure.",
  },
  {
    title: "Responsible sourcing",
    description: "Low-impact dyes and recycled fibers with full supply chain traceability.",
  },
  {
    title: "Lifetime care",
    description: "Complimentary repairs and care guides to extend the life of every garment.",
  },
];

export default function UspBadges() {
  return (
    <section aria-labelledby="usp-heading" className="space-y-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-8">
      <h2 id="usp-heading" className="text-lg font-semibold text-neutral-900">
        Why Claroche
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2">
        {BADGES.map((badge) => (
          <li key={badge.title} className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">{badge.title}</h3>
            <p className="text-sm text-neutral-600">{badge.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
