import { describe, it, expect } from "vitest";
import {
  formatCompact,
  formatNumber,
  formatBirthDate,
  zodiacFrom,
  formatAge,
  daysUntil,
  formatDday,
} from "@/lib/formatters";

describe("formatCompact", () => {
  it("formats thousands", () => {
    expect(formatCompact(9876)).toBe("9,876");
    expect(formatCompact(98_700)).toBe("98.7K");
  });
  it("formats millions", () => {
    expect(formatCompact(66_334_830)).toBe("66.3M");
    expect(formatCompact(1_400_000)).toBe("1.4M");
  });
  it("formats billions", () => {
    // ≥100M rounds to whole numbers by design
    expect(formatCompact(228_252_529)).toBe("228M");
    expect(formatCompact(10_587_102_276)).toBe("10.59B");
  });
  it("handles invalid input gracefully", () => {
    expect(formatCompact(NaN)).toBe("—");
  });
});

describe("formatNumber", () => {
  it("groups digits", () => {
    expect(formatNumber(228252529)).toBe("228,252,529");
  });
});

describe("formatBirthDate", () => {
  it("renders verified ISO dates", () => {
    expect(formatBirthDate("2007-04-11")).toBe("Apr 11, 2007");
    expect(formatBirthDate("2002-03-20")).toBe("Mar 20, 2002");
  });
});

describe("zodiacFrom (derived, arithmetic only)", () => {
  it("maps AHYEON Apr 11 → Aries", () => {
    expect(zodiacFrom("2007-04-11")).toBe("Aries");
  });
  it("maps CHIQUITA Feb 17 → Aquarius", () => {
    expect(zodiacFrom("2009-02-17")).toBe("Aquarius");
  });
  it("maps RORA Aug 14 → Leo", () => {
    expect(zodiacFrom("2008-08-14")).toBe("Leo");
  });
});

describe("formatAge", () => {
  const now = new Date("2026-10-29T00:00:00Z");
  it("formats relative ages", () => {
    expect(formatAge("2026-10-25T00:00:00Z", now)).toBe("4 days ago");
    expect(formatAge("2026-10-15T00:00:00Z", now)).toBe("2 weeks ago");
    expect(formatAge("2026-09-29T00:00:00Z", now)).toBe("1 month ago");
  });
  it("handles future dates without crashing", () => {
    expect(formatAge("2026-11-05T00:00:00Z", now)).toBe("just now");
  });
});

describe("daysUntil (KST calendar)", () => {
  it("counts whole days to a future date", () => {
    const now = new Date("2026-10-29T06:00:00Z"); // 15:00 KST
    expect(daysUntil("2026-11-07", now)).toBe(9);
  });
  it("returns 0 on the day itself", () => {
    const now = new Date("2026-11-07T00:30:00Z"); // 09:30 KST Nov 7
    expect(daysUntil("2026-11-07", now)).toBe(0);
  });
});

describe("formatDday", () => {
  it("formats countdown labels", () => {
    expect(formatDday(9)).toBe("D-9");
    expect(formatDday(0)).toBe("D-DAY");
    expect(formatDday(-3)).toBe("D+3");
  });
});
