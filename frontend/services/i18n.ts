import { createInstance } from "i18next";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";

export function createI18n(language = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? "ko") {
  const instance = createInstance();
  void instance.init({ lng: language, fallbackLng: "ko", resources: { ko: { translation: ko }, en: { translation: en } } });
  return instance;
}

