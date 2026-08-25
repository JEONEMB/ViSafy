"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isLocale, messages, type Locale } from "@/i18n/config";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  text: (typeof messages)[Locale];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("visafyLocale");
    if (isLocale(saved)) {
      updateLocale(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  function setLocale(nextLocale: Locale) {
    updateLocale(nextLocale);
    localStorage.setItem("visafyLocale", nextLocale);
    document.documentElement.lang = nextLocale;
  }

  const value = useMemo(() => ({ locale, setLocale, text: messages[locale] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
