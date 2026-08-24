import type { Locale } from "@/i18n/config";

export type FinancialPurposeCode =
  | "OPEN_ACCOUNT" | "RECEIVE_SALARY" | "SAVE_MONEY" | "SEND_MONEY_HOME"
  | "GET_DEBIT_CARD" | "GET_CREDIT_CARD" | "GET_LOAN" | "RENT_HOUSING"
  | "INVEST" | "BUILD_CREDIT";

const labels: Record<Locale, Record<FinancialPurposeCode, string>> = {
  ko: { OPEN_ACCOUNT: "입출금계좌를 만들고 싶어요", RECEIVE_SALARY: "급여를 받을 계좌가 필요해요", SAVE_MONEY: "돈을 저축하고 싶어요", SEND_MONEY_HOME: "해외로 송금하고 싶어요", GET_DEBIT_CARD: "체크카드를 만들고 싶어요", GET_CREDIT_CARD: "신용카드를 만들고 싶어요", GET_LOAN: "대출이 필요해요", RENT_HOUSING: "주거금융이 필요해요", INVEST: "투자를 시작하고 싶어요", BUILD_CREDIT: "한국에서 신용이력을 만들고 싶어요" },
  en: { OPEN_ACCOUNT: "I want to open an account", RECEIVE_SALARY: "I need an account to receive salary", SAVE_MONEY: "I want to save money", SEND_MONEY_HOME: "I want to send money abroad", GET_DEBIT_CARD: "I want a debit card", GET_CREDIT_CARD: "I want a credit card", GET_LOAN: "I need a loan", RENT_HOUSING: "I need housing finance", INVEST: "I want to invest", BUILD_CREDIT: "I want to build credit in Korea" },
  vi: { OPEN_ACCOUNT: "Tôi muốn mở tài khoản", RECEIVE_SALARY: "Tôi cần tài khoản để nhận lương", SAVE_MONEY: "Tôi muốn tiết kiệm", SEND_MONEY_HOME: "Tôi muốn gửi tiền ra nước ngoài", GET_DEBIT_CARD: "Tôi muốn làm thẻ ghi nợ", GET_CREDIT_CARD: "Tôi muốn làm thẻ tín dụng", GET_LOAN: "Tôi cần khoản vay", RENT_HOUSING: "Tôi cần tài chính nhà ở", INVEST: "Tôi muốn đầu tư", BUILD_CREDIT: "Tôi muốn xây dựng tín dụng tại Hàn Quốc" },
};

export const allFinancialPurposes: FinancialPurposeCode[] = ["OPEN_ACCOUNT", "RECEIVE_SALARY", "SAVE_MONEY", "SEND_MONEY_HOME", "GET_DEBIT_CARD", "GET_CREDIT_CARD", "GET_LOAN", "RENT_HOUSING", "INVEST", "BUILD_CREDIT"];
export const landingFinancialPurposes: FinancialPurposeCode[] = ["RECEIVE_SALARY", "SAVE_MONEY", "SEND_MONEY_HOME", "GET_DEBIT_CARD", "GET_LOAN", "OPEN_ACCOUNT"];
export const financialPurposeLabel = (locale: Locale, purpose: FinancialPurposeCode) => labels[locale][purpose];
