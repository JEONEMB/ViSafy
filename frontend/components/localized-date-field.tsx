"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";

type Props = {
  label: string;
  locale: Locale;
  name: string;
  yearLabel: string;
  monthLabel: string;
  dayLabel: string;
  minYear: number;
  maxYear: number;
};

const selectClass = "mt-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-2";

export function LocalizedDateField({ label, locale, name, yearLabel, monthLabel, dayLabel, minYear, maxYear }: Props) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const years = useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index), [minYear, maxYear]);
  const maxDay = year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;

  useEffect(() => {
    if (day && Number(day) > maxDay) setDay("");
  }, [day, maxDay]);

  const parts = {
    year: <select aria-label={yearLabel} className={`${selectClass} flex-[1.25]`} key="year" required value={year} onChange={(event) => setYear(event.target.value)}><option value="" disabled>{yearLabel}</option>{years.map((value) => <option key={value} value={value}>{value}</option>)}</select>,
    month: <select aria-label={monthLabel} className={`${selectClass} flex-1`} key="month" required value={month} onChange={(event) => setMonth(event.target.value)}><option value="" disabled>{monthLabel}</option>{Array.from({ length: 12 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select>,
    day: <select aria-label={dayLabel} className={`${selectClass} flex-1`} key="day" required value={day} onChange={(event) => setDay(event.target.value)}><option value="" disabled>{dayLabel}</option>{Array.from({ length: maxDay }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select>,
  };
  const order: Array<keyof typeof parts> = locale === "ko" ? ["year", "month", "day"] : locale === "en" ? ["month", "day", "year"] : ["day", "month", "year"];
  const value = year && month && day ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : "";

  return (
    <label className="text-sm font-medium">
      {label}
      <span className="flex gap-2">{order.map((part) => parts[part])}</span>
      <input name={name} type="hidden" value={value} />
    </label>
  );
}
