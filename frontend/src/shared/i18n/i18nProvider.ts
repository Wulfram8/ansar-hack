import type { I18nProvider } from "@refinedev/core";
import { ru } from "./ru";

function resolve(key: string): string | undefined {
  return key.split(".").reduce<any>((acc, part) => acc?.[part], ru);
}

function interpolate(text: string, options?: Record<string, unknown>): string {
  if (!options) return text;
  return text.replace(/{{\s*(\w+)\s*}}/g, (_, name) =>
    options[name] != null ? String(options[name]) : "",
  );
}

/** Простой статичный провайдер локализации (только русский). */
export const i18nProvider: I18nProvider = {
  translate: (key, options, defaultMessage) => {
    const found = resolve(key);
    if (typeof found === "string") return interpolate(found, options as any);
    return (defaultMessage as string) ?? key;
  },
  changeLocale: async () => undefined,
  getLocale: () => "ru",
};
