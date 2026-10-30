/* MONSTIEZ Universe — shared utilities
 * Day logic: a "day" in this app is a Korea day (KST, UTC+9), matching where the
 * music releases. Timestamps shown to the user use their own clock.
 */
(() => {
  'use strict';
  const KST_OFFSET_MIN = 9 * 60;

  const MONSTIEZ = (window.MONSTIEZ = window.MONSTIEZ || {});

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  /** Current KST day as YYYY-MM-DD. */
  function kstDay(date = new Date()) {
    const kst = new Date(date.getTime() + KST_OFFSET_MIN * 60000);
    return kst.toISOString().slice(0, 10);
  }

  /** Full ISO instant of a YYYY-MM-DD KST day boundary-independent label. */
  function dayLabel(day) {
    if (!day) return '—';
    const [y, m, d] = day.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  function dayShort(day) {
    if (!day) return '—';
    const [y, m, d] = day.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  }

  /** Compact number: 13.5M, 98.2K, 1,234 — for deltas and distances. */
  function compact(n) {
    if (n == null || Number.isNaN(n)) return null;
    const abs = Math.abs(n);
    if (abs >= 1e9) return trim(n / 1e9) + 'B';
    if (abs >= 1e6) return trim(n / 1e6) + 'M';
    if (abs >= 1e4) return trim(n / 1e3) + 'K';
    return Math.round(n).toLocaleString('en-US');
  }
  function trim(x) {
    return (Math.round(x * 10) / 10).toString().replace(/\.0$/, '');
  }

  /** Full thousand-separated number. */
  function full(n) {
    if (n == null || Number.isNaN(n)) return null;
    return Math.round(n).toLocaleString('en-US');
  }

  /** Signed delta like "+9,972,175" or "−1,204". */
  function delta(n, { compact: useCompact = false } = {}) {
    if (n == null || Number.isNaN(n)) return null;
    const sign = n > 0 ? '+' : n < 0 ? '−' : '';
    const body = useCompact ? compact(Math.abs(n)) : full(Math.abs(n));
    return sign + body;
  }

  /** "13 days ago" style age relative to a KST day. */
  function daysAgoLabel(day, today = kstDay()) {
    if (!day) return null;
    const a = Date.parse(day + 'T00:00:00Z');
    const b = Date.parse(today + 'T00:00:00Z');
    const diff = Math.round((b - a) / 86400000);
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    if (diff < 0) return `${-diff}d ahead`;
    return `${diff} days ago`;
  }

  /** Parse a recording's day key record: {v, estimated, source, method, ...}. */
  function isMeasured(rec) { return rec && !rec.estimated; }

  /** Sorted day keys of a series object. */
  function seriesDays(series) { return series ? Object.keys(series).sort() : []; }

  /** Latest reading of a series. */
  function latest(series) {
    const days = seriesDays(series);
    if (!days.length) return null;
    const day = days[days.length - 1];
    return { day, ...series[day] };
  }

  /**
   * The last FULL KST day for which a delta can be honest: the latest measured
   * day that is strictly before the current KST day AND has a predecessor reading.
   * Mirrors the reference rule: a day still running would always look like a bad day.
   */
  function lastFullDelta(series, today = kstDay()) {
    const days = seriesDays(series).filter(d => d < today && isMeasured(series[d]));
    for (let i = days.length - 1; i >= 1; i--) {
      const d = days[i];
      const prev = days[i - 1];
      const prevRec = series[prev];
      if (!prevRec) continue;
      const span = Math.round((Date.parse(d + 'T00:00:00Z') - Date.parse(prev + 'T00:00:00Z')) / 86400000);
      const gain = series[d].v - prevRec.v;
      const perDay = gain / span;
      return {
        day: d, prevDay: prev, gain, span, perDay,
        estimated: series[d].estimated || prevRec.estimated || span > 1,
        measured: span === 1 && !series[d].estimated && !prevRec.estimated,
      };
    }
    return null;
  }

  /** Sorted numeric points [{day, v, estimated}] of a series. */
  function points(series) {
    return seriesDays(series).map(day => ({ day, ...series[day] }));
  }

  /** Add n days to a YYYY-MM-DD. */
  function addDays(day, n) {
    const t = Date.parse(day + 'T00:00:00Z') + n * 86400000;
    return new Date(t).toISOString().slice(0, 10);
  }

  /** Difference in days between two day keys. */
  function dayDiff(a, b) {
    return Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000);
  }

  /** Milestone marks, per the audited reference set. */
  const MARKS = [];
  (() => {
    const base = [10e6, 20e6, 50e6, 100e6, 150e6, 200e6];
    for (const b of base) MARKS.push(b);
    for (let m = 300e6; ; m += 100e6) { MARKS.push(m); if (m >= 2e10) break; }
  })();

  /** Milestones reached/passed for a cumulative series. */
  function milestones(series, { kind = 'views' } = {}) {
    const pts = points(series);
    if (!pts.length) return { passed: [], next: null };
    const passed = [];
    let next = null;
    for (const mark of MARKS) {
      if (kind === 'subscribers' && mark < 1e6) continue;
      // first day the value reached the mark
      const hit = pts.find(p => p.v >= mark);
      if (!hit) {
        const last = pts[pts.length - 1];
        next = { mark, remaining: mark - last.v, reachedOn: null };
        break;
      }
      const idx = pts.indexOf(hit);
      const after = idx > 0 ? pts[idx - 1] : null;
      if (!after) {
        // The mark was already passed at our very first reading — it predates
        // this app's observation window, so no honest date exists.
        passed.push({ mark, onDay: null, rangeStart: null, beforeHistory: true, uncertain: true, estimated: hit.estimated });
        continue;
      }
      passed.push({
        mark,
        onDay: hit.day,
        rangeStart: after.day,
        uncertain: after.v < mark,
        estimated: hit.estimated,
      });
    }
    return { passed, next };
  }

  /** Project when a milestone will be reached — returns a month or a month range, never a day. */
  function projectMilestone(series, mark, { minHistoryDays = 2, perDayOverride = null } = {}) {
    const pts = points(series);
    if (!pts.length || pts.length < minHistoryDays || pts.length < 2) {
      return { ok: false, reason: 'history' };
    }
    // two fair estimates: average daily gain over all history, and over the last 7 days
    const first = pts[0], last = pts[pts.length - 1];
    const totalDays = Math.max(1, dayDiff(last.day, first.day));
    const overall = (last.v - first.v) / totalDays;
    const recentPts = pts.slice(-8);
    const recent = recentPts.length >= 2
      ? (recentPts[recentPts.length - 1].v - recentPts[0].v) / Math.max(1, dayDiff(recentPts[recentPts.length - 1].day, recentPts[0].day))
      : overall;
    const rate = perDayOverride || (recent > 0 ? recent : overall);
    if (!rate || rate <= 0) return { ok: false, reason: 'pace' };
    const remaining = mark - last.v;
    if (remaining <= 0) return { ok: false, reason: 'reached' };
    const daysLow = Math.ceil(remaining / Math.max(rate, overall));
    const daysHigh = Math.ceil(remaining / Math.min(rate, overall));
    const toMonth = (d) => {
      const dt = new Date(Date.parse(kstDay() + 'T00:00:00Z') + d * 86400000);
      return dt.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });
    };
    const mLow = toMonth(daysLow), mHigh = toMonth(daysHigh);
    return {
      ok: true,
      days: daysHigh,
      month: mLow === mHigh ? mLow : `${mLow}–${mHigh}`,
    };
  }

  /** Biggest day analysis for a cumulative series. */
  function biggestDay(series, { startsAtRelease = null } = {}) {
    const pts = points(series).filter(p => isMeasured(p) || p.estimated);
    if (pts.length < 3) return null;
    let peak = null;
    for (let i = 1; i < pts.length; i++) {
      const span = dayDiff(pts[i].day, pts[i - 1].day);
      if (span !== 1) continue; // only clean day-to-day diffs count
      const gain = pts[i].v - pts[i - 1].v;
      if (!peak || gain > peak.gain) peak = { day: pts[i].day, gain };
    }
    if (!peak) return null;
    let halfLife = null;
    if (startsAtRelease) {
      for (let i = 1; i < pts.length; i++) {
        const span = dayDiff(pts[i].day, pts[i - 1].day);
        if (span !== 1) continue;
        const gain = pts[i].v - pts[i - 1].v;
        if (gain <= peak.gain / 2 && dayDiff(pts[i].day, peak.day) > 0) {
          halfLife = dayDiff(pts[i].day, peak.day);
          break;
        }
      }
    }
    const stillClimbing = pts[pts.length - 1].day <= peak.day ||
      (pts[pts.length - 1].v - pts[pts.length - 2].v) >= peak.gain;
    return { peak, halfLife, stillClimbing, hasFullHistory: Boolean(startsAtRelease) };
  }

  /** Percent helper for like-rate style displays. */
  function perThousand(a, b) {
    if (!a || !b) return null;
    return Math.round((a / b) * 1000 * 10) / 10;
  }

  MONSTIEZ.util = {
    escapeHtml, kstDay, dayLabel, dayShort, compact, full, delta, daysAgoLabel,
    isMeasured, seriesDays, latest, lastFullDelta, points, addDays, dayDiff,
    MARKS, milestones, projectMilestone, biggestDay, perThousand,
  };
})();
