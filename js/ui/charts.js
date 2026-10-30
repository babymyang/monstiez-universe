/* MONSTIEZ Universe — SVG chart engine for the tracker.
 * Line = cumulative total. Bars underneath = amount added per day/week/month/year.
 * Touch/press to read a value; dotted bars = incomplete period; release markers
 * along the top; numbered note dots below (text written out under the chart).
 */
(() => {
  'use strict';
  const MONSTIEZ = (window.MONSTIEZ = window.MONSTIEZ || {});
  const U = MONSTIEZ.util;

  const PINK = '#ff4f9a', LAVENDER = '#a78bfa', GREY = '#9b8fa6', INK = '#3a3242';

  /** Aggregate measured points into buckets of `granularity` days ending at the latest day. */
  function bucketDiffs(pts, granularity, endDay) {
    // pts: sorted [{day,v,estimated}]; returns [{start, end, gain, complete, est, label}]
    if (pts.length < 2) return [];
    const out = [];
    const lastDay = pts[pts.length - 1].day;
    // map day -> point
    const byDay = new Map(pts.map(p => [p.day, p]));
    // walk from the earliest point forward in bucket steps anchored at endDay
    const end = Date.parse(endDay + 'T00:00:00Z');
    // align bucket end down to endDay; start from first point's bucket
    const first = pts[0].day;
    let bucketEnd = end;
    const DAY = 86400000;
    while (bucketEnd >= Date.parse(first + 'T00:00:00Z')) {
      const bucketStart = bucketEnd - (granularity - 1) * DAY;
      const startKey = new Date(bucketStart).toISOString().slice(0, 10);
      const endKey = new Date(bucketEnd).toISOString().slice(0, 10);
      // last reading within [bucketStart, bucketEnd] and last reading before it
      let lastIn = null, prevOutside = null;
      for (const p of pts) {
        if (p.day <= endKey) { prevOutside = lastIn; lastIn = p; }
        else break;
      }
      if (lastIn && lastIn.day <= endKey && lastIn.day >= startKey) {
        const gain = prevOutside ? lastIn.v - prevOutside.v : null;
        const covered = prevOutside ? U.dayDiff(lastIn.day, prevOutside.day) : 0;
        const bucketDays = Math.min(U.dayDiff(endKey, startKey) + 1, U.dayDiff(endKey, first) + 1);
        const incomplete = covered < bucketDays;
        out.push({
          start: startKey, end: lastIn.day,
          bucketStart: startKey, bucketEnd: endKey,
          gain, value: lastIn.v, estimated: lastIn.estimated,
          incomplete: prevOutside ? incomplete : true,
          partialTail: endKey > lastDay,
          label: granularity === 1 ? U.dayShort(startKey)
            : granularity === 7 ? `w/e ${U.dayShort(endKey)}`
            : granularity === 30 ? U.dayShort(startKey)
            : startKey.slice(0, 4),
          granularity,
        });
      }
      bucketEnd -= granularity * DAY;
    }
    return out.reverse();
  }

  function niceTicks(min, max, count = 4) {
    if (min === max) { min = min * 0.9; max = max * 1.1 || 1; }
    const span = max - min;
    const step = Math.pow(10, Math.floor(Math.log10(span / count)));
    const err = span / count / step;
    const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
    const s = step * mult;
    const start = Math.floor(min / s) * s;
    const ticks = [];
    for (let t = start; t <= max + s * 0.5; t += s) ticks.push(t);
    return ticks;
  }

  /**
   * Render a tracker chart.
   * el: container element. opts: {
   *   points: [{day,v,estimated}], range: 'day'|'week'|'month'|'year'|'all',
   *   windowStart/windowEnd: day keys (panning window),
   *   releases: [{day, label}], notes: [{day, text}],
   *   unit: 'views'|'plays'|'followers',
   *   onRead: fn({day, value}) — touch/press readout callback
   * }
   */
  function render(el, opts) {
    const pts = (opts.points || []).filter(p => p.v != null).sort((a, b) => a.day < b.day ? -1 : 1);
    el.innerHTML = '';
    if (pts.length < 2) {
      el.innerHTML = `<div class="chart-empty">
        <img src="./assets/myangni-peek.svg" alt="" width="74" height="74"/>
        <p><b>History is building up.</b></p>
        <p>This chart appears once at least two dated readings exist. New dated snapshots are collected every day — nothing is ever invented to fill the gap.</p>
        <p class="micro-note">First reading: ${U.dayLabel(pts[0] && pts[0].day)} · latest: ${U.dayLabel(pts[pts.length - 1] && pts[pts.length - 1].day)}</p>
      </div>`;
      return;
    }

    const W = 560, H = 300, PADL = 46, PADR = 12, PADT = 18, PADB = 26;
    const BAR_H = 92, LINE_H = H - BAR_H - 30; // top area line chart, bottom bars
    const granularity = { day: 1, week: 7, month: 30, year: 365 }[opts.range] || 30;
    const winStart = opts.windowStart || pts[0].day;
    const winEnd = opts.windowEnd || pts[pts.length - 1].day;
    const winPts = pts.filter(p => p.day >= winStart && p.day <= winEnd);
    const usePts = winPts.length >= 2 ? winPts : pts.slice(-2);
    const x = (day) => {
      const t0 = Date.parse(usePts[0].day + 'T00:00:00Z');
      const t1 = Date.parse(usePts[usePts.length - 1].day + 'T00:00:00Z');
      const t = Date.parse(day + 'T00:00:00Z');
      return PADL + (t1 === t0 ? 0 : ((t - t0) / (t1 - t0)) * (W - PADL - PADR));
    };
    const vals = usePts.map(p => p.v);
    const vMin = Math.min(...vals), vMax = Math.max(...vals);
    const ticks = niceTicks(vMin, vMax, 4);
    const lo = ticks[0], hi = ticks[ticks.length - 1];
    const y = (v) => PADT + (1 - (v - lo) / (hi - lo || 1)) * LINE_H;

    const bars = bucketDiffs(usePts, granularity, usePts[usePts.length - 1].day);
    const gains = bars.map(b => Math.max(0, b.gain || 0));
    const gMax = Math.max(1, ...gains);
    const yBar = (g) => H - PADB - (g / gMax) * (BAR_H - 14);

    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cumulative ${opts.unit || 'total'} with ${granularity === 1 ? 'daily' : granularity === 7 ? 'weekly' : granularity === 30 ? 'monthly' : 'yearly'} additions" class="tracker-svg">`;
    // gridlines + y labels
    for (const t of ticks) {
      svg += `<line x1="${PADL}" x2="${W - PADR}" y1="${y(t)}" y2="${y(t)}" stroke="#f1e7ef" stroke-width="1"/>`;
      svg += `<text x="${PADL - 6}" y="${y(t) + 3.5}" text-anchor="end" font-size="9" fill="${GREY}">${U.compact(t)}</text>`;
    }
    // area + line
    const linePts = usePts.map(p => `${x(p.day)},${y(p.v)}`);
    svg += `<polygon points="${PADL},${y(lo)} ${linePts.join(' ')} ${x(usePts[usePts.length - 1].day)},${y(lo)}" fill="${PINK}" opacity=".12"/>`;
    svg += `<polyline points="${linePts.join(' ')}" fill="none" stroke="${PINK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const p of usePts) {
      svg += `<circle cx="${x(p.day)}" cy="${y(p.v)}" r="3.4" fill="#fff" stroke="${PINK}" stroke-width="2.2"${p.estimated ? ' stroke-dasharray="2.5 2"' : ''}/>`;
    }
    // release markers along the top
    for (const r of (opts.releases || [])) {
      if (r.day < usePts[0].day || r.day > usePts[usePts.length - 1].day) continue;
      const rx = x(r.day);
      svg += `<g class="rel-mark" data-rel-day="${r.day}"><line x1="${rx}" x2="${rx}" y1="${PADT - 8}" y2="${PADT - 2}" stroke="${LAVENDER}" stroke-width="2"/>` +
        `<rect x="${rx - 5}" y="${PADT - 16}" width="10" height="10" rx="3" fill="${LAVENDER}"/></g>`;
    }
    // bars
    const barW = Math.max(2, Math.min(16, (W - PADL - PADR) / Math.max(bars.length, 1) - 3));
    bars.forEach((b, i) => {
      if (b.gain == null) return;
      const bx = x(b.start) + 1;
      const by = yBar(Math.max(0, b.gain));
      const h = Math.max(1.5, H - PADB - by);
      const stroke = b.incomplete || b.partialTail;
      svg += `<rect class="bar" data-i="${i}" x="${bx}" y="${by}" width="${barW}" height="${h}" rx="2.5" ` +
        `fill="${stroke ? 'none' : LAVENDER}" ${stroke ? `stroke="${LAVENDER}" stroke-width="1.4" stroke-dasharray="3 2.5"` : ''} opacity="${b.estimated ? '.75' : '1'}"/>`;
    });
    // note dots under the bars
    const noteIdx = new Map();
    (opts.notes || []).forEach((n, i) => {
      if (n.day < usePts[0].day || n.day > usePts[usePts.length - 1].day) return;
      const nx = x(n.day);
      const slot = noteIdx.has(n.day) ? noteIdx.get(n.day) + 1 : 0;
      noteIdx.set(n.day, slot);
      svg += `<circle class="note-dot" data-note="${i}" cx="${nx + slot * 8}" cy="${H - PADB + 6}" r="4.4" fill="${LAVENDER}"/>` +
        `<text x="${nx + slot * 8}" y="${H - PADB + 9}" text-anchor="middle" font-size="6.5" fill="#fff">${i + 1}</text>`;
    });
    // x labels: first, last, and a few middles
    const lbls = new Set([usePts[0].day, usePts[usePts.length - 1].day]);
    if (usePts.length > 6) {
      const mid = usePts[Math.floor(usePts.length / 2)];
      lbls.add(mid.day);
    }
    for (const d of lbls) {
      svg += `<text x="${x(d)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="${GREY}">${U.dayShort(d)}</text>`;
    }
    svg += `</svg>`;
    el.innerHTML = svg;

    // note text under chart
    const visibleNotes = (opts.notes || []).filter(n => n.day >= usePts[0].day && n.day <= usePts[usePts.length - 1].day);
    if (visibleNotes.length) {
      const list = document.createElement('div');
      list.className = 'chart-notes';
      list.innerHTML = visibleNotes.map((n, i) =>
        `<p><i>${(opts.notes || []).indexOf(n) + 1}</i>${U.escapeHtml(n.text)}</p>`).join('');
      el.appendChild(list);
    }

    // press/touch readout
    const svgEl = el.querySelector('svg');
    const readout = document.createElement('div');
    readout.className = 'chart-readout';
    readout.setAttribute('role', 'status');
    readout.innerHTML = `<span>Touch the chart to read a day.</span>`;
    el.insertBefore(readout, svgEl);
    const show = (evt) => {
      const rect = svgEl.getBoundingClientRect();
      const cx = ((evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left) / rect.width * W;
      let best = null, bestD = 1e9;
      for (const p of usePts) { const d = Math.abs(x(p.day) - cx); if (d < bestD) { bestD = d; best = p; } }
      if (best) {
        readout.innerHTML = `<b>${U.dayLabel(best.day)}</b> · ${U.full(best.v)} ${opts.unit || ''}${best.estimated ? ' · est' : ''}`;
        if (opts.onRead) opts.onRead(best);
      }
    };
    svgEl.addEventListener('pointerdown', show);
    svgEl.addEventListener('pointermove', (e) => { if (e.pressure > 0 || e.buttons) show(e); });
    svgEl.addEventListener('touchmove', show, { passive: true });
  }

  /** Album chart (F-18): the record's total line with each track's own line as a band underneath.
   * Tapping a track chip highlights that band; the readout reads the day across total + highlighted band. */
  const BAND_COLOURS = ['#a78bfa', '#7cc5f0', '#7ed6a5', '#f0a35c', '#e58cc4', '#c9b6f2', '#8fd4c1', '#f2b6c9'];

  function renderBands(el, { total, bands, unit = 'plays' }) {
    const totalPts = (total || []).filter(p => p.v != null).sort((a, b) => a.day < b.day ? -1 : 1);
    el.innerHTML = '';
    if (totalPts.length < 2) {
      el.innerHTML = `<div class="chart-empty"><img src="./assets/myangni-peek.svg" alt="" width="64"/><p><b>History is building up.</b></p><p>The record's own chart appears once at least two dated readings exist for it.</p></div>`;
      return;
    }
    const W = 560, H = 240, PADL = 46, PADR = 12, PADT = 16, PADB = 26;
    const d0 = totalPts[0].day, d1 = totalPts[totalPts.length - 1].day;
    const t0 = Date.parse(d0 + 'T00:00:00Z'), t1 = Date.parse(d1 + 'T00:00:00Z');
    let max = Math.max(...totalPts.map(p => p.v));
    const cleanBands = (bands || []).map((b, i) => ({
      name: b.name || `Track ${i + 1}`, colour: BAND_COLOURS[i % BAND_COLOURS.length],
      pts: (b.points || []).filter(p => p.v != null && p.day >= d0 && p.day <= d1).sort((a, c) => a.day < c.day ? -1 : 1),
    }));
    for (const b of cleanBands) for (const p of b.pts) max = Math.max(max, p.v);
    const ticks = niceTicks(0, max, 4);
    const hi = ticks[ticks.length - 1];
    const x = (day) => PADL + ((Date.parse(day + 'T00:00:00Z') - t0) / (t1 - t0 || 1)) * (W - PADL - PADR);
    const y = (v) => PADT + (1 - v / (hi || 1)) * (H - PADT - PADB);
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Record total with per-track bands" class="tracker-svg">`;
    for (const t of ticks) {
      svg += `<line x1="${PADL}" x2="${W - PADR}" y1="${y(t)}" y2="${y(t)}" stroke="#f1e7ef" stroke-width="1"/>`;
      svg += `<text x="${PADL - 6}" y="${y(t) + 3.5}" text-anchor="end" font-size="9" fill="${GREY}">${U.compact(t)}</text>`;
    }
    cleanBands.forEach((b, i) => {
      if (b.pts.length < 2) return;
      const path = b.pts.map((p, j) => `${j ? 'L' : 'M'}${x(p.day).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
      svg += `<path class="band" data-band="${i}" d="${path}" fill="none" stroke="${b.colour}" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>`;
    });
    const linePts = totalPts.map(p => `${x(p.day).toFixed(1)},${y(p.v).toFixed(1)}`);
    svg += `<polygon points="${PADL},${y(ticks[0])} ${linePts.join(' ')} ${x(d1).toFixed(1)},${y(ticks[0])}" fill="${PINK}" opacity=".10"/>`;
    svg += `<polyline points="${linePts.join(' ')}" fill="none" stroke="${PINK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const d of new Set([d0, d1])) {
      svg += `<text x="${x(d)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="${GREY}">${U.dayShort(d)}</text>`;
    }
    svg += `</svg>`;
    el.innerHTML = svg;

    const legend = document.createElement('div');
    legend.className = 'band-legend';
    legend.innerHTML = cleanBands.map((b, i) => {
      if (b.pts.length < 2) return `<span class="band-chip static"><i style="background:${b.colour}"></i>${U.escapeHtml(b.name)} · not enough readings for a band yet</span>`;
      return `<button class="band-chip" data-band="${i}" aria-pressed="false"><i style="background:${b.colour}"></i>${U.escapeHtml(b.name)}</button>`;
    }).join('');
    el.appendChild(legend);
    const note = document.createElement('p');
    note.className = 'micro-note';
    note.textContent = 'The thick line is the whole record — each band is one track\u2019s own readings. Bands are never added to anything outside this record.';
    el.appendChild(note);

    // highlight interaction
    const svgEl = el.querySelector('svg');
    legend.querySelectorAll('button.band-chip').forEach(chip => chip.addEventListener('click', () => {
      const idx = chip.dataset.band;
      const on = chip.getAttribute('aria-pressed') !== 'true';
      legend.querySelectorAll('button.band-chip').forEach(c => { c.setAttribute('aria-pressed', 'false'); });
      svgEl.querySelectorAll('.band').forEach(b => { b.style.opacity = '.14'; b.style.strokeWidth = '1.6'; });
      if (on) {
        chip.setAttribute('aria-pressed', 'true');
        const sel = svgEl.querySelector(`.band[data-band="${idx}"]`);
        if (sel) { sel.style.opacity = '.95'; sel.style.strokeWidth = '3'; }
      } else {
        svgEl.querySelectorAll('.band').forEach(b => { b.style.opacity = '.5'; b.style.strokeWidth = '1.8'; });
      }
    }));

    // readout: nearest total day; reads highlighted band's value too
    const readout = document.createElement('div');
    readout.className = 'chart-readout';
    readout.setAttribute('role', 'status');
    readout.innerHTML = `<span>Touch the chart to read a day.</span>`;
    el.insertBefore(readout, svgEl);
    const show = (evt) => {
      const rect = svgEl.getBoundingClientRect();
      const cx = ((evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left) / rect.width * W;
      let best = null, bestD = 1e9;
      for (const p of totalPts) { const d = Math.abs(x(p.day) - cx); if (d < bestD) { bestD = d; best = p; } }
      if (!best) return;
      const selIdx = [...legend.querySelectorAll('button.band-chip')].find(c => c.getAttribute('aria-pressed') === 'true');
      let bandTxt = '';
      if (selIdx) {
        const b = cleanBands[+selIdx.dataset.band];
        const bp = b && b.pts.find(p => p.day === best.day);
        if (bp) bandTxt = ` · ${U.escapeHtml(b.name)} ${U.full(bp.v)}`;
      }
      readout.innerHTML = `<b>${U.dayLabel(best.day)}</b> · ${U.full(best.v)} ${unit}${bandTxt}`;
    };
    svgEl.addEventListener('pointerdown', show);
    svgEl.addEventListener('pointermove', (e) => { if (e.pressure > 0 || e.buttons) show(e); });
    svgEl.addEventListener('touchmove', show, { passive: true });
  }

  /** Simple multi-series age-aligned comparison chart (compare view). */
  function renderCompare(el, seriesList, { unit = 'views', maxDay = 120 } = {}) {
    // seriesList: [{name, colour, points:[{day,v}], startDay}]
    const W = 560, H = 280, PADL = 46, PADR = 12, PADT = 16, PADB = 26;
    let max = 0;
    const aligned = seriesList.map(s => {
      const pts = s.points.filter(p => p.day >= s.startDay)
        .map(p => ({ age: U.dayDiff(p.day, s.startDay), v: p.v }))
        .filter(p => p.age <= maxDay);
      for (const p of pts) max = Math.max(max, p.v);
      return { ...s, pts };
    });
    if (!aligned.length || !aligned.some(s => s.pts.length >= 2)) {
      el.innerHTML = `<div class="chart-empty"><img src="./assets/myangni-peek.svg" alt="" width="74" height="74"/><p><b>Not enough history yet.</b></p><p>Age-aligned comparison needs at least two dated readings per release.</p></div>`;
      return;
    }
    const ticks = niceTicks(0, max, 4);
    const hi = ticks[ticks.length - 1];
    const x = (age) => PADL + (Math.min(age, maxDay) / maxDay) * (W - PADL - PADR);
    const y = (v) => PADT + (1 - v / (hi || 1)) * (H - PADT - PADB);
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Releases compared from the day each one came out">`;
    for (const t of ticks) {
      svg += `<line x1="${PADL}" x2="${W - PADR}" y1="${y(t)}" y2="${y(t)}" stroke="#f1e7ef"/>`;
      svg += `<text x="${PADL - 6}" y="${y(t) + 3.5}" text-anchor="end" font-size="9" fill="${GREY}">${U.compact(t)}</text>`;
    }
    for (let d = 0; d <= maxDay; d += maxDay > 90 ? 30 : 14) {
      svg += `<text x="${x(d)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="${GREY}">${d}d</text>`;
    }
    for (const s of aligned) {
      if (s.pts.length < 2) continue;
      const path = s.pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.age)} ${y(p.v)}`).join(' ');
      svg += `<path d="${path}" fill="none" stroke="${s.colour}" stroke-width="2.6" stroke-linecap="round"/>`;
      const last = s.pts[s.pts.length - 1];
      svg += `<circle cx="${x(last.age)}" cy="${y(last.v)}" r="3.4" fill="${s.colour}"/>`;
    }
    svg += `</svg>`;
    el.innerHTML = svg;
    const legend = document.createElement('div');
    legend.className = 'compare-legend';
    legend.innerHTML = aligned.map(s => `<span><i style="background:${s.colour}"></i>${U.escapeHtml(s.name)}</span>`).join('');
    el.appendChild(legend);
  }

  MONSTIEZ.charts = { render, renderCompare, renderBands, bucketDiffs, niceTicks };
})();
