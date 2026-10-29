/** Formatting helpers — Intl-based, timezone-aware, no invented data. */

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** 228252529 → "228.3M" ; 9876 → "9,876" */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n < 10_000) return formatNumber(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}K`;
  }
  if (n < 1_000_000_000) {
    const v = n / 1_000_000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`;
  }
  const v = n / 1_000_000_000;
  return `${v >= 100 ? Math.round(v) : v.toFixed(2).replace(/\.00$/, "").replace(/0$/, "")}B`;
}

export function formatDate(iso: string, timeZone?: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(d);
}

/** "Apr 11, 2007" from "2007-04-11" */
export function formatBirthDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Derived zodiac sign from a verified birth date (labeled "derived" in UI). */
export function zodiacFrom(isoDate: string): string {
  const [, m, d] = isoDate.split("-").map(Number);
  // [month, day boundary, sign that starts on that boundary]
  const boundaries: [number, number, string][] = [
    [1, 1, "Capricorn"], [1, 20, "Aquarius"], [2, 19, "Pisces"], [3, 21, "Aries"],
    [4, 20, "Taurus"], [5, 21, "Gemini"], [6, 22, "Cancer"], [7, 23, "Leo"],
    [8, 23, "Virgo"], [9, 23, "Libra"], [10, 24, "Scorpio"], [11, 23, "Sagittarius"],
    [12, 22, "Capricorn"],
  ];
  let sign = "Capricorn";
  for (const [bm, bd, s] of boundaries) {
    if (m > bm || (m === bm && d >= bd)) sign = s;
  }
  return sign;
}

/** "4 days ago" / "2 weeks ago" — only for sourced publish dates. */
export function formatAge(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const days = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (days < 0) return "just now";
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (days < 365) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/** Whole-day countdown (KST calendar) to a YYYY-MM-DD date. */
export function daysUntil(dateIso: string, now = new Date()): number | null {
  const todayKst = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(now); // YYYY-MM-DD
  const target = dateIso.slice(0, 10);
  const diff = Math.round(
    (Date.parse(`${target}T00:00:00Z`) - Date.parse(`${todayKst}T00:00:00Z`)) /
      86400000,
  );
  return Number.isFinite(diff) ? diff : null;
}

export function formatDday(days: number): string {
  if (days > 0) return `D-${days}`;
  if (days === 0) return "D-DAY";
  return `D+${Math.abs(days)}`;
}
