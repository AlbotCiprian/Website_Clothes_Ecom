"use client";

import { FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Caută produse Claroche"
      className="flex w-full max-w-lg items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow ring-1 ring-neutral-200"
    >
      <Search className="h-4 w-4 text-neutral-400" aria-hidden="true" />
      <Input
        type="search"
        placeholder="Caută echipamente, colecții sau inspirație"
        className="border-none px-0 focus-visible:ring-0"
      />
      <button
        type="submit"
        className="focus-ring inline-flex h-9 items-center justify-center rounded-full bg-neutral-900 px-4 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-800"
        aria-label="Inițiază căutarea"
      >
        Caută
      </button>
    </form>
  );
}
