import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "fr", "it", "en", "es", "pl", "sk", "pt", "sq"],
  defaultLocale: "de",
  localePrefix: "as-needed",
});
