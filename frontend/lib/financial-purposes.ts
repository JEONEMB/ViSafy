import type { Locale } from "@/i18n/config";

export type FinancialPurposeCode =
  | "OPEN_ACCOUNT" | "RECEIVE_SALARY" | "SAVE_MONEY" | "SEND_MONEY_HOME"
  | "GET_DEBIT_CARD" | "GET_CREDIT_CARD" | "GET_LOAN" | "RENT_HOUSING"
  | "INVEST" | "BUILD_CREDIT";

const labels: Record<Locale, Record<FinancialPurposeCode, string>> = {
  ko: { OPEN_ACCOUNT: "입출금계좌를 만들고 싶어요", RECEIVE_SALARY: "급여를 받을 계좌가 필요해요", SAVE_MONEY: "돈을 저축하고 싶어요", SEND_MONEY_HOME: "해외로 송금하고 싶어요", GET_DEBIT_CARD: "체크카드를 만들고 싶어요", GET_CREDIT_CARD: "신용카드를 만들고 싶어요", GET_LOAN: "대출이 필요해요", RENT_HOUSING: "주거금융이 필요해요", INVEST: "투자를 시작하고 싶어요", BUILD_CREDIT: "한국에서 신용이력을 만들고 싶어요" },
  en: { OPEN_ACCOUNT: "I want to open an account", RECEIVE_SALARY: "I need an account to receive salary", SAVE_MONEY: "I want to save money", SEND_MONEY_HOME: "I want to send money abroad", GET_DEBIT_CARD: "I want a debit card", GET_CREDIT_CARD: "I want a credit card", GET_LOAN: "I need a loan", RENT_HOUSING: "I need housing finance", INVEST: "I want to invest", BUILD_CREDIT: "I want to build credit in Korea" },
  vi: { OPEN_ACCOUNT: "Tôi muốn mở tài khoản", RECEIVE_SALARY: "Tôi cần tài khoản để nhận lương", SAVE_MONEY: "Tôi muốn tiết kiệm", SEND_MONEY_HOME: "Tôi muốn gửi tiền ra nước ngoài", GET_DEBIT_CARD: "Tôi muốn làm thẻ ghi nợ", GET_CREDIT_CARD: "Tôi muốn làm thẻ tín dụng", GET_LOAN: "Tôi cần khoản vay", RENT_HOUSING: "Tôi cần tài chính nhà ở", INVEST: "Tôi muốn đầu tư", BUILD_CREDIT: "Tôi muốn xây dựng tín dụng tại Hàn Quốc" },
  zh: { OPEN_ACCOUNT: "我想开一个账户", RECEIVE_SALARY: "我需要一个工资账户", SAVE_MONEY: "我想存钱", SEND_MONEY_HOME: "我想向海外汇款", GET_DEBIT_CARD: "我想办理借记卡", GET_CREDIT_CARD: "我想办理信用卡", GET_LOAN: "我需要贷款", RENT_HOUSING: "我需要住房金融服务", INVEST: "我想开始投资", BUILD_CREDIT: "我想在韩国建立信用记录" },
  ja: { OPEN_ACCOUNT: "口座を開設したい", RECEIVE_SALARY: "給与受取口座が必要", SAVE_MONEY: "貯蓄したい", SEND_MONEY_HOME: "海外送金したい", GET_DEBIT_CARD: "デビットカードを作りたい", GET_CREDIT_CARD: "クレジットカードを作りたい", GET_LOAN: "ローンが必要", RENT_HOUSING: "住宅金融が必要", INVEST: "投資を始めたい", BUILD_CREDIT: "韓国で信用履歴を作りたい" },
  th: { OPEN_ACCOUNT: "ฉันต้องการเปิดบัญชี", RECEIVE_SALARY: "ฉันต้องการบัญชีรับเงินเดือน", SAVE_MONEY: "ฉันต้องการออมเงิน", SEND_MONEY_HOME: "ฉันต้องการโอนเงินไปต่างประเทศ", GET_DEBIT_CARD: "ฉันต้องการบัตรเดบิต", GET_CREDIT_CARD: "ฉันต้องการบัตรเครดิต", GET_LOAN: "ฉันต้องการสินเชื่อ", RENT_HOUSING: "ฉันต้องการบริการการเงินเพื่อที่อยู่อาศัย", INVEST: "ฉันต้องการเริ่มลงทุน", BUILD_CREDIT: "ฉันต้องการสร้างประวัติเครดิตในเกาหลี" },
};

export const allFinancialPurposes: FinancialPurposeCode[] = ["OPEN_ACCOUNT", "RECEIVE_SALARY", "SAVE_MONEY", "SEND_MONEY_HOME", "GET_DEBIT_CARD", "GET_CREDIT_CARD", "GET_LOAN", "RENT_HOUSING", "INVEST", "BUILD_CREDIT"];
export const landingFinancialPurposes: FinancialPurposeCode[] = ["RECEIVE_SALARY", "SAVE_MONEY", "SEND_MONEY_HOME", "GET_DEBIT_CARD", "GET_LOAN", "OPEN_ACCOUNT"];
export const financialPurposeLabel = (locale: Locale, purpose: FinancialPurposeCode) => labels[locale][purpose];
