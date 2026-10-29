/**
 * Content/data validators — reject placeholder values & unverified dates
 * before they can reach a production build (brief §5.6).
 */
import members from "@data/members.json";
import content from "@data/content.json";
import events from "@data/events.json";
import songs from "@data/song-catalog.json";
import snapshots from "@data/metric-snapshots.json";

export interface ValidationIssue {
  file: string;
  id: string;
  problem: string;
  severity: "error" | "warning";
}

const PLACEHOLDER_PATTERNS = [/example/i, /placeholder/i, /lorem/i, /TODO/i, /dummy/i];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z)?$/;

export function validateData(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // members: every member needs a verified birthdate + source
  for (const m of members.members) {
    if (!ISO_DATE.test(m.birthDate)) {
      issues.push({ file: "members.json", id: m.slug, problem: `birthDate "${m.birthDate}" is not ISO`, severity: "error" });
    }
    if (!m.birthDateSource?.startsWith("https://")) {
      issues.push({ file: "members.json", id: m.slug, problem: "birthDateSource missing/invalid", severity: "error" });
    }
  }

  // content: no placeholder titles; official URLs only
  for (const c of content.items) {
    if (PLACEHOLDER_PATTERNS.some((p) => p.test(c.title))) {
      issues.push({ file: "content.json", id: c.id, problem: `placeholder-like title "${c.title}"`, severity: "error" });
    }
    if (!c.url.startsWith("https://www.youtube.com/") && !c.url.startsWith("https://youtu.be/")) {
      issues.push({ file: "content.json", id: c.id, problem: `non-official URL ${c.url}`, severity: "error" });
    }
    if (c.status === "verified" && !c.verifiedAt) {
      issues.push({ file: "content.json", id: c.id, problem: "verified without verifiedAt", severity: "warning" });
    }
  }

  // events: upcoming events must not be invented dates in the past
  for (const e of events.events) {
    if (e.state === "upcoming" && e.date && new Date(e.date) < new Date("2026-01-01")) {
      issues.push({ file: "events.json", id: e.id, problem: "upcoming event with stale date", severity: "error" });
    }
    if (!e.sourceUrl?.startsWith("https://")) {
      issues.push({ file: "events.json", id: e.id, problem: "sourceUrl missing/invalid", severity: "error" });
    }
  }

  // songs: featured verified songs need real links
  for (const s of songs.songs) {
    if (s.status === "verified" && !s.youtubeUrl && !s.spotifyUrl) {
      issues.push({ file: "song-catalog.json", id: s.id, problem: "no official link", severity: "error" });
    }
  }

  // snapshots: production metrics must never be 0 / placeholder / demo
  for (const s of snapshots.snapshots) {
    if (s.value <= 0) {
      issues.push({ file: "metric-snapshots.json", id: `${s.entityId}/${s.metric}`, problem: `value ${s.value} is a placeholder`, severity: "error" });
    }
    if (!ISO_DATE.test(s.observedAt)) {
      issues.push({ file: "metric-snapshots.json", id: `${s.entityId}/${s.metric}`, problem: `observedAt "${s.observedAt}" is not ISO`, severity: "error" });
    }
    if (!s.sourceUrl?.startsWith("https://")) {
      issues.push({ file: "metric-snapshots.json", id: `${s.entityId}/${s.metric}`, problem: "sourceUrl missing/invalid", severity: "error" });
    }
  }
  // demo series must stay flagged demo
  for (const d of snapshots.demo.series) {
    if (d.status !== "demo") {
      issues.push({ file: "metric-snapshots.json", id: `${d.entityId}/demo`, problem: "demo series entry not flagged demo", severity: "error" });
    }
  }

  return issues;
}

export function assertProductionSafe(): void {
  const errors = validateData().filter((i) => i.severity === "error");
  if (process.env.NODE_ENV === "production" && errors.length > 0) {
    const msg = errors.map((e) => `${e.file}:${e.id} — ${e.problem}`).join("; ");
    throw new Error(`Production data validation failed: ${msg}`);
  }
}
