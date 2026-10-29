import { describe, it, expect } from "vitest";
import { validateData } from "@/lib/validation";
import {
  members,
  getSnapshots,
  nextUpcomingEvent,
  latestSnapshot,
  snapshotSeries,
  contentForMember,
  trendingSongs,
} from "@/lib/data";

describe("data provenance (brief §10 trust checks)", () => {
  it("all 7 members have verified official-sourced birth dates", () => {
    expect(members).toHaveLength(7);
    for (const m of members) {
      expect(m.status).toBe("verified");
      expect(m.birthDateSource).toContain("ygfamily.com");
      expect(m.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("member slugs and order match the official profile order", () => {
    expect(members.map((m) => m.slug)).toEqual([
      "ruka", "pharita", "asa", "ahyeon", "rami", "rora", "chiquita",
    ]);
  });

  it("production snapshots never contain placeholders or demo values", () => {
    const snaps = getSnapshots();
    expect(snaps.length).toBeGreaterThan(0);
    for (const s of snaps) {
      expect(s.value).toBeGreaterThan(0);
      expect(s.status).not.toBe("demo");
      expect(s.sourceUrl).toMatch(/^https:\/\//);
      expect(s.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  it("records the two real observations made on 2026-10-29", () => {
    expect(latestSnapshot("wlHwjkYpSr0")?.value).toBe(228252529);
    expect(latestSnapshot("oC6brLXQe4I")?.value).toBe(66334830);
  });

  it("chart series require >=2 dated observations (single snapshot → no chart)", () => {
    expect(snapshotSeries("wlHwjkYpSr0").length).toBe(1);
    // the UI renders the empty state unless length >= 2 — enforced in StatsClient
  });

  it("next upcoming verified event is the Bangkok tour stop", () => {
    const next = nextUpcomingEvent();
    expect(next?.city).toBe("Bangkok");
    expect(next?.date).toBe("2026-11-07");
    expect(next?.status).toBe("verified");
  });

  it("trending songs are verified and featured only", () => {
    for (const s of trendingSongs()) {
      expect(s.status).toBe("verified");
      expect(s.featured).toBe(true);
    }
  });

  it("contentForMember returns empty for untagged members (honest empty states)", () => {
    // no per-member tagged content has been verified yet
    expect(contentForMember("ahyeon")).toHaveLength(0);
  });
});

describe("data validator (brief §5.6)", () => {
  it("passes with no blocking errors for the shipped dataset", () => {
    const errors = validateData().filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
  });
});
