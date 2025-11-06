"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductListResponse, SortOption } from "@/lib/products";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";

type ProductFiltersProps = {
  facets: ProductListResponse["facets"];
  initialState: {
    sizes: string[];
    colors: string[];
    sort: SortOption;
    minPrice?: number;
    maxPrice?: number;
  };
};

const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: "Featured", value: "featured" },
  { label: "New arrivals", value: "new" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

function centsToInput(value?: number) {
  if (value == null) return "";
  return (value / 100).toString();
}

function inputToCents(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const normalised = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(normalised);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, Math.round(parsed * 100));
}

export default function ProductFilters({ facets, initialState }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialState.sizes);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialState.colors);
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialState.sort);
  const [minPriceInput, setMinPriceInput] = useState(centsToInput(initialState.minPrice));
  const [maxPriceInput, setMaxPriceInput] = useState(centsToInput(initialState.maxPrice));

  const lastAppliedPrices = useRef<{ min?: number; max?: number }>({
    min: initialState.minPrice,
    max: initialState.maxPrice,
  });

  useEffect(() => {
    setSelectedSizes(initialState.sizes);
    setSelectedColors(initialState.colors);
    setSelectedSort(initialState.sort);
    setMinPriceInput(centsToInput(initialState.minPrice));
    setMaxPriceInput(centsToInput(initialState.maxPrice));
    lastAppliedPrices.current = {
      min: initialState.minPrice,
      max: initialState.maxPrice,
    };
  }, [initialState]);

  const updateRoute = useCallback(
    (next: {
      sizes: string[];
      colors: string[];
      sort: SortOption;
      minPrice?: number;
      maxPrice?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      params.delete("page");
      params.delete("size");
      params.delete("color");
      params.delete("minPrice");
      params.delete("maxPrice");

      if (next.sizes.length) {
        next.sizes.forEach((size) => params.append("size", size));
      }

      if (next.colors.length) {
        next.colors.forEach((color) => params.append("color", color));
      }

      if (next.sort && next.sort !== "featured") {
        params.set("sort", next.sort);
      } else {
        params.delete("sort");
      }

      if (next.minPrice != null) {
        params.set("minPrice", (next.minPrice / 100).toString());
      }

      if (next.maxPrice != null) {
        params.set("maxPrice", (next.maxPrice / 100).toString());
      }

      router.replace(
        params.toString().length ? `${pathname}?${params.toString()}` : pathname,
        { scroll: false },
      );
    },
    [pathname, router, searchParams],
  );

  const handleSizeToggle = useCallback(
    (size: string) => {
      setSelectedSizes((prev) => {
        const next = prev.includes(size) ? prev.filter((value) => value !== size) : [...prev, size];
        updateRoute({
          sizes: next,
          colors: selectedColors,
          sort: selectedSort,
          minPrice: lastAppliedPrices.current.min,
          maxPrice: lastAppliedPrices.current.max,
        });
        return next;
      });
    },
    [selectedColors, selectedSort, updateRoute],
  );

  const handleColorToggle = useCallback(
    (color: string) => {
      setSelectedColors((prev) => {
        const next = prev.includes(color)
          ? prev.filter((value) => value !== color)
          : [...prev, color];
        updateRoute({
          sizes: selectedSizes,
          colors: next,
          sort: selectedSort,
          minPrice: lastAppliedPrices.current.min,
          maxPrice: lastAppliedPrices.current.max,
        });
        return next;
      });
    },
    [selectedSizes, selectedSort, updateRoute],
  );

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as SortOption;
      setSelectedSort(value);
      updateRoute({
        sizes: selectedSizes,
        colors: selectedColors,
        sort: value,
        minPrice: lastAppliedPrices.current.min,
        maxPrice: lastAppliedPrices.current.max,
      });
    },
    [selectedColors, selectedSizes, updateRoute],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const minPrice = inputToCents(minPriceInput);
      const maxPrice = inputToCents(maxPriceInput);

      if (
        minPrice === lastAppliedPrices.current.min &&
        maxPrice === lastAppliedPrices.current.max
      ) {
        return;
      }

      if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
        return;
      }

      lastAppliedPrices.current = { min: minPrice, max: maxPrice };
      updateRoute({
        sizes: selectedSizes,
        colors: selectedColors,
        sort: selectedSort,
        minPrice,
        maxPrice,
      });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [
    maxPriceInput,
    minPriceInput,
    selectedColors,
    selectedSizes,
    selectedSort,
    updateRoute,
  ]);

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    lastAppliedPrices.current.min != null ||
    lastAppliedPrices.current.max != null ||
    selectedSort !== "featured";

  const clearFilters = useCallback(() => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedSort("featured");
    setMinPriceInput("");
    setMaxPriceInput("");
    lastAppliedPrices.current = {};
    updateRoute({ sizes: [], colors: [], sort: "featured" });
  }, [updateRoute]);

  const priceRangeLabel = useMemo(() => {
    const { min, max } = facets.priceRange;
    if (min == null || max == null) {
      return null;
    }

    return `${formatMoney(min)} – ${formatMoney(max)}`;
  }, [facets.priceRange]);

  return (
    <div className="space-y-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Filter & Sort</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
            aria-disabled={!hasActiveFilters}
          >
            Clear
          </Button>
        </div>
        <p className="text-xs text-neutral-500">
          Adjust filters to refine the product list. Price inputs update after a short pause.
        </p>
      </div>

      <div className="space-y-3">
        <label htmlFor="sort" className="text-sm font-medium text-neutral-800">
          Sort
        </label>
        <select
          id="sort"
          name="sort"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          value={selectedSort}
          onChange={handleSortChange}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-neutral-800">Size</legend>
        <div className="flex flex-wrap gap-2">
          {facets.sizes.length === 0 ? (
            <p className="text-xs text-neutral-500">Sizes load as inventory becomes available.</p>
          ) : (
            facets.sizes.map((size) => {
              const selected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`min-w-[3rem] rounded-full border px-3 py-1 text-sm transition ${
                    selected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                  }`}
                  aria-pressed={selected}
                >
                  {size}
                </button>
              );
            })
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-neutral-800">Color</legend>
        <div className="flex flex-wrap gap-2">
          {facets.colors.length === 0 ? (
            <p className="text-xs text-neutral-500">Colors load as catalog expands.</p>
          ) : (
            facets.colors.map((color) => {
              const selected = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorToggle(color)}
                  className={`rounded-full border px-4 py-1 text-sm transition ${
                    selected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                  }`}
                  aria-pressed={selected}
                >
                  {color}
                </button>
              );
            })
          )}
        </div>
      </fieldset>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-800">Price</h3>
          {priceRangeLabel ? (
            <span className="text-xs text-neutral-500">Range: {priceRangeLabel}</span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="minPrice" className="text-xs uppercase tracking-wide text-neutral-500">
              Min
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={minPriceInput}
              onChange={(event) => setMinPriceInput(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="maxPrice" className="text-xs uppercase tracking-wide text-neutral-500">
              Max
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          Prices are shown in USD. Leave fields blank to include the full range.
        </p>
      </div>
    </div>
  );
}
