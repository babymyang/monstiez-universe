"use client";

import { ChipRowProps } from "./chip-types";

/** Pill chip row — selected chip is saturated pink. Functional filter control. */
export default function ChipRow({
  options,
  value,
  onChange,
  ariaLabel = "Filters",
}: ChipRowProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-2 overflow-x-auto no-scrollbar py-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`chip ${active ? "chip-active" : "chip-idle"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
