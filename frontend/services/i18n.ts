import { createInstance } from "i18next";
import en from "@/locales/en/common.json";
import ja from "@/locales/ja/common.json";
import ko from "@/locales/ko/common.json";
import th from "@/locales/th/common.json";
import vi from "@/locales/vi/common.json";
import zh from "@/locales/zh/common.json";

export function createI18n(language = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? "ko") {
  const instance = createInstance();
  void instance.init({ lng: language, fallbackLng: "en", resources: { ko: { translation: ko }, en: { translation: en }, vi: { translation: vi }, zh: { translation: zh }, ja: { translation: ja }, th: { translation: th } } });
  return instance;
}
