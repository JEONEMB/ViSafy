"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isLocale, messages, type Locale } from "@/i18n/config";
import { updateProfileLanguage } from "@/services/profile";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  text: (typeof messages)[Locale];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Diagnosis messages, access details, guidance, the financial journey, and AI answers are all
 * generated in the language stored on the profile. Without this, switching language left every
 * one of them in the language the profile was created with.
 */
function syncProfileLanguage(nextLocale: Locale) {
  const id = Number(localStorage.getItem("visafyProfileId"));
  const sessionId = localStorage.getItem("visafyProfileSessionId");
  if (!id || !sessionId) return;
  void updateProfileLanguage(id, sessionId, nextLocale).catch(() => {
    // An expired or missing profile must never block a language change.
  });
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("visafyLocale");
    if (isLocale(saved)) updateLocale(saved);
  }, []);

  // <html lang> lives outside React, so it is mirrored from the state rather than written by
  // whichever handler happened to change the language.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    updateLocale(nextLocale);
    localStorage.setItem("visafyLocale", nextLocale);
    syncProfileLanguage(nextLocale);
  }, []);

  const value = useMemo(() => ({ locale, setLocale, text: messages[locale] }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
