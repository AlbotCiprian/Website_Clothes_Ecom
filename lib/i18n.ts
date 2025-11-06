const dictionaries: Record<string, Record<string, string>> = {
  en: {
    "nav.shop": "Shop Claroche",
    "cta.explore": "Explore the collection",
  },
};

export function t(key: string, locale = "en") {
  const dictionary = dictionaries[locale] ?? dictionaries.en;
  return dictionary[key] ?? key;
}
