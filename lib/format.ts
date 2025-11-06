const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";

export function formatMoney(
  amountInMinorUnits: number,
  options: { currency?: string; locale?: string } = {},
): string {
  const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = options;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  });

  return formatter.format(amountInMinorUnits / 100);
}

export function formatPriceRange(
  minCents: number | null | undefined,
  maxCents: number | null | undefined,
  options: { currency?: string; locale?: string } = {},
): string | null {
  if (minCents == null && maxCents == null) {
    return null;
  }

  if (minCents != null && maxCents != null && minCents === maxCents) {
    return formatMoney(minCents, options);
  }

  if (minCents == null) {
    return `Up to ${formatMoney(maxCents!, options)}`;
  }

  if (maxCents == null) {
    return `From ${formatMoney(minCents, options)}`;
  }

  const lower = formatMoney(minCents, options);
  const upper = formatMoney(maxCents, options);
  return `${lower} – ${upper}`;
}

export function parseMoneyInput(value: string | number): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value * 100) : null;
  }

  const normalised = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalised);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}
