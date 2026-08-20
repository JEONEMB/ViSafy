"use client";

import { useState, type ChangeEvent, type FocusEvent } from "react";

type Props = {
  label: string;
  name: string;
  minYear: number;
  maxYear: number;
  hint: string;
  invalidMessage: string;
  reason?: string;
};

const inputClass = "ui-input";

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function isValidDate(value: string, minYear: number, maxYear: number) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (year < minYear || year > maxYear) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function LocalizedDateField({ label, name, minYear, maxYear, hint, invalidMessage, reason }: Props) {
  const [value, setValue] = useState("");

  function change(event: ChangeEvent<HTMLInputElement>) {
    event.currentTarget.setCustomValidity("");
    setValue(formatDateInput(event.currentTarget.value));
  }

  function validate(event: FocusEvent<HTMLInputElement>) {
    event.currentTarget.setCustomValidity(isValidDate(value, minYear, maxYear) ? "" : invalidMessage);
  }

  return (
    <label className="ui-label">
      <span className="inline-flex items-center gap-1.5">{label}{reason ? <span aria-label={reason} className="inline-flex h-6 w-6 cursor-help items-center justify-center rounded-full border border-line bg-surface-subtle text-xs font-bold text-muted" title={reason}>?</span> : null}</span>
      <input
        aria-describedby={`${name}-hint`}
        autoComplete="off"
        className={inputClass}
        inputMode="numeric"
        maxLength={10}
        name={name}
        onBlur={validate}
        onChange={change}
        onInvalid={validate}
        pattern="\d{4}-\d{2}-\d{2}"
        placeholder="YYYY-MM-DD"
        required
        value={value}
      />
      <span className="mt-1.5 block text-xs text-muted" id={`${name}-hint`}>{hint}</span>
    </label>
  );
}
