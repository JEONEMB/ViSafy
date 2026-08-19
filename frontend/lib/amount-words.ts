import type { Locale } from "@/i18n/config";

export function digitsOnly(value: string, maxLength = 15) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, maxLength);
}

export function formatGroupedDigits(value: string, locale: Locale) {
  if (!value) return "";
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : locale === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function amountInWords(value: string, locale: Locale) {
  if (!value) return "";
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) return "";
  if (locale === "en") return `${englishInteger(amount)} Korean won`;
  if (locale === "vi") return `${vietnameseInteger(amount)} won Hàn Quốc`;
  return `${koreanInteger(amount)} 원`;
}

function koreanInteger(value: number) {
  if (value === 0) return "영";
  const smallUnits = ["", "십", "백", "천"];
  const largeUnits = ["", "만", "억", "조"];
  const digits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  const groups: string[] = [];
  let remaining = value;
  while (remaining > 0) {
    const group = remaining % 10000;
    let text = "";
    for (let position = 0, current = group; current > 0; position += 1, current = Math.floor(current / 10)) {
      const digit = current % 10;
      if (digit) text = `${digit === 1 && position > 0 ? "" : digits[digit]}${smallUnits[position]}${text}`;
    }
    groups.push(text);
    remaining = Math.floor(remaining / 10000);
  }
  return groups.map((group, index) => group ? `${group}${largeUnits[index] ?? ""}` : "").reverse().join("");
}

function englishInteger(value: number) {
  if (value === 0) return "zero";
  const scales = ["", "thousand", "million", "billion", "trillion"];
  const groups: string[] = [];
  let remaining = value;
  let scale = 0;
  while (remaining > 0) {
    const group = remaining % 1000;
    if (group) groups.unshift(`${englishUnderThousand(group)}${scales[scale] ? ` ${scales[scale]}` : ""}`);
    remaining = Math.floor(remaining / 1000);
    scale += 1;
  }
  return groups.join(" ");
}

function englishUnderThousand(value: number) {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const parts: string[] = [];
  if (value >= 100) {
    parts.push(`${ones[Math.floor(value / 100)]} hundred`);
    value %= 100;
  }
  if (value >= 20) {
    parts.push(`${tens[Math.floor(value / 10)]}${value % 10 ? `-${ones[value % 10]}` : ""}`);
  } else if (value) {
    parts.push(ones[value]);
  }
  return parts.join(" ");
}

function vietnameseInteger(value: number) {
  if (value === 0) return "không";
  const scales = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ"];
  const groups: string[] = [];
  let remaining = value;
  let scale = 0;
  while (remaining > 0) {
    const group = remaining % 1000;
    if (group) groups.unshift(`${vietnameseUnderThousand(group)}${scales[scale] ? ` ${scales[scale]}` : ""}`);
    remaining = Math.floor(remaining / 1000);
    scale += 1;
  }
  return groups.join(" ");
}

function vietnameseUnderThousand(value: number) {
  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  if (hundreds) parts.push(`${digits[hundreds]} trăm`);
  if (tens > 1) parts.push(`${digits[tens]} mươi`);
  else if (tens === 1) parts.push("mười");
  else if (ones && hundreds) parts.push("lẻ");
  if (ones) {
    if (ones === 1 && tens > 1) parts.push("mốt");
    else if (ones === 5 && tens > 0) parts.push("lăm");
    else parts.push(digits[ones]);
  }
  return parts.join(" ");
}
