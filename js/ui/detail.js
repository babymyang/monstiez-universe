/* MONSTIEZ Universe — release detail view (one video or one song).
 * BM Tracker audit parity: F-11..F-17 (totals, position, weekly pace, likes-per-1000,
 * song slices, history chart, milestones ladder, biggest day, other versions).
 */
(() => {
  'use strict';
  const MONSTIEZ = (window.MONSTIEZ = window.MONSTIEZ || {});
  const U = MONSTIEZ.util;
  const esc = U.escapeHtml;

  const S = { range: 'week', windowOffset: 0 };

  function render(kind, id) {
    const host = document.getElementById('detailRoot');
    const store = MONSTIEZ.store;
    const st = store.get();
    if (!st.loaded) { host.innerHTML = loadingHtml(); return; }

    const item = kind === 'v' ? store.videoById(id) : store.songByKey(id);
    if (!item) {
      host.innerHTML = emptyHtml(`That ${kind === 'v' ? 'video' : 'recording'} is not in the tracked set.`, kind);
      return;
    }
    const series = kind === 'v' ? item.views : item.plays;
    const unit = kind === 'v' ? 'views' : 'plays';
    const l = series && U.latest(series);
    const d = series && U.lastFullDelta(series);
    const ranks = MONSTIEZ.store.rankMap(kind);
    const rank = ranks[item.id || item.key];
    const total = ranks && rank ? Object.keys(ranks).length : 0;
    const work = store.workOf(item);

    // weekly pace vs usual (needs >= 8 days)
    const pace = paceInfo(series);

    // version list (works)
    const versions = work ? [...work.songs, ...work.videos].filter(x => (x.id || x.key) !== (item.id || item.key)) : [];
    const tvOthers = versions.filter(v => v.tag && v.tag !== 'music_video');
    const mainOthers = versions.filter(v => !v.tag || v.tag === 'music_video');

    host.innerHTML = `
      <div class="detail-shell">
        <div class="detail-hero">
          ${kind === 'v'
            ? `<a class="d-thumb" href="https://www.youtube.com/watch?v=${esc(item.id)}" target="_blank" rel="noopener"><img src="${esc(item.thumb)}" alt="" onerror="this.parentNode.classList.add('broken')"/><span>Open on YouTube ↗</span></a>`
            : `<span class="d-cover">${item.cover ? `<img src="${esc(item.cover)}" alt=""/>` : '♪'}</span>`}
          <div class="d-head">
            <h1>${esc(item.title || item.name)}</h1>
            <p class="d-meta">
              <span class="badge">${esc(kind === 'v' ? (tagLabel(item.tag)) : 'RECORDING')}</span>
              ${esc(kind === 'v' ? item.channel : item.album + ' · ' + U.dayShort(item.releaseDate))}
              ${work ? ` · part of <a href="#work/${work.id}" data-nav="work/${work.id}">${esc(work.name)}</a>` : ''}
            </p>
            <div class="d-big">
              <div><strong>${esc(U.full(l ? l.v : null) || word(l, series))}</strong><span>${unit} total</span></div>
              <div><b class="${d && d.measured ? '' : 'est'}">${d ? esc((d.measured ? '+' : 'est +') + U.full(d.gain)) : 'No full day'}</b><span>${d ? `on ${U.dayShort(d.day)}${d.span > 1 ? ` · over ${d.span} days` : ''}` : 'no measured daily gain yet'}</span></div>
            </div>
            <p class="d-src micro-note">${sourceLine(l)}</p>
          </div>
        </div>

        <div class="d-statrow">
          <div class="d-stat"><b>${rank ? ordinal(rank) : '—'}</b><span>${rank ? `of ${total} in the ${kind === 'v' ? 'video' : 'song'} list` : 'not ranked yet'}</span></div>
          <div class="d-stat"><b>${pace ? esc('+' + U.compact(pace.perDay)) + '/day' : '—'}</b><span>${pace ? esc(pace.text) : 'needs a few more days of readings'}</span></div>
          ${kind === 'v' ? likeRateHtml(item) : slicesHtml(item)}
        </div>

        <section class="card">
          <div class="card-title-row">
            <div><p class="kicker">HISTORY</p><h2>How it grew</h2></div>
            <div class="range-row" role="group" aria-label="Time range">
              ${['day', 'week', 'month', 'year', 'all'].map(r => `<button data-range="${r}" class="${S.range === r ? 'selected' : ''}" ${r === 'day' && !hasDayResolution(series) ? 'disabled title="No sub-day readings exist"' : ''}>${r[0].toUpperCase() + r.slice(1)}</button>`).join('')}
            </div>
          </div>
          <div class="range-nav">
            <button id="dPrev" aria-label="Show the previous period" ${S.windowOffset >= 0 ? 'disabled' : ''}>‹</button>
            <span id="dWindow" class="d-window"></span>
            <button id="dNext" aria-label="Show the next period" ${S.windowOffset >= 0 ? 'disabled' : ''}>›</button>
          </div>
          <div id="dChart" class="d-chart"></div>
          <p class="micro-note">Line = total ${unit}. Bars = ${rangeWord()} additions. Dotted bar = period still incomplete. Circles with dashed outline = estimated readings.</p>
        </section>

        <section class="card">
          <div class="card-title-row"><div><p class="kicker">ROUND NUMBERS</p><h2>Milestones</h2></div></div>
          <div id="dMilestones"></div>
        </section>

        <section class="card" id="dBigday"></section>

        ${versions.length ? `
        <section class="card">
          <div class="card-title-row"><div><p class="kicker">OTHER VERSIONS</p><h2>Every form of this release</h2></div></div>
          <div class="ver-list">
            ${mainOthers.map(vRow).join('')}
            ${tvOthers.length > 3 ? `${tvOthers.slice(0, 2).map(vRow).join('')}<button class="ver-more" id="verMore">${tvOthers.length - 2} more appearances</button><div class="ver-hidden" hidden>${tvOthers.slice(2).map(vRow).join('')}</div>` : tvOthers.map(vRow).join('')}
          </div>
          <p class="micro-note">Views and plays count different things, so versions are never added together — each keeps its own number and its own word for it.</p>
        </section>` : ''}

        <div class="d-actions">
          <a class="secondary-btn" href="#compare/from/${kind}/${esc(item.id || item.key)}" data-nav="compare/from/${kind}/${esc(item.id || item.key)}">Compare with…</a>
          <a class="secondary-btn" href="#tracker" data-nav="tracker">‹ Back to tracker</a>
        </div>
      </div>`;

    renderChart(kind, item, series, unit);
    renderMilestones(host.querySelector('#dMilestones'), series, unit, kind);
    renderBigDay(host.querySelector('#dBigday'), series, unit, item);
    bindDetail(host, kind, item, series, unit);
  }

  function tagLabel(tag) {
    const t = ((MONSTIEZ.store.get().catalog || {}).tags || []).find(t => t.slug === tag);
    return t ? t.label : (tag || 'video').replace('_', ' ');
  }
  function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

  function word(l, series) {
    if (!series) return 'No count';
    return 'No count';
  }

  function sourceLine(l) {
    if (!l) return 'No published reading is available for this release yet.';
    const srcName = sourceName(l.source, l.method);
    return `Source: ${esc(srcName)} · observed ${esc(U.dayLabel(l.day))}${l.estimated ? ' · estimated reading' : ''}`;
  }

  function sourceName(url, method) {
    if (!url) return 'unknown';
    try {
      const host = new URL(url).host;
      if (host.includes('bm-tracker')) return 'bm-tracker.com public figures (credited observation; not affiliated)';
      if (host.includes('kworb')) return 'Kworb (third-party public stream figures)';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube public page (manual observation)';
      if (host.includes('facebook')) return 'YG official announcement';
      return host;
    } catch { return url; }
  }

  function likeRateHtml(item) {
    const v = item.views, lk = item.likes;
    const lv = v && U.latest(v), ll = lk && U.latest(lk);
    const allTime = U.perThousand(ll && ll.v, lv && lv.v);
    // recent 7d rate: latest likes minus likes ~7d ago / latest views minus views ~7d ago
    let recent = null;
    if (v && lk) {
      const vd = windowDelta(v), ld = windowDelta(lk);
      if (vd && ld) recent = U.perThousand(ld.gain, vd.gain);
    }
    return `<div class="d-stat"><b>${allTime != null ? allTime : '—'}</b><span>likes per 1,000 ${allTime != null ? 'views all time' : 'views'}${recent != null ? ` · ${recent} last 7 days` : ''}</span></div>`;
  }

  function windowDelta(series, days = 7) {
    const pts = U.points(series);
    if (pts.length < 2) return null;
    const last = pts[pts.length - 1];
    const target = U.addDays(last.day, -days);
    let best = pts[0];
    for (const p of pts) { if (p.day <= target) best = p; else break; }
    const span = U.dayDiff(last.day, best.day);
    if (span < 2) return null;
    return { gain: last.v - best.v, span, estimated: last.estimated || best.estimated || span > days };
  }

  function slicesHtml(item) {
    const plays = item.plays;
    if (!plays) return `<div class="d-stat"><b>—</b><span>no play readings yet</span></div>`;
    const all = shareSlices(plays);
    return `<div class="d-stat"><b>${all.allTime != null ? all.allTime + '%' : '—'}</b><span>of every play in the list${all.recent != null ? ` · ${all.recent}% of the last 7 days` : ''}</span></div>`;
  }

  function shareSlices(plays) {
    const store = MONSTIEZ.store;
    const songs = store.songList();
    const l = U.latest(plays);
    let totalAll = 0;
    for (const s of songs) { const sl = s.plays && U.latest(s.plays); if (sl) totalAll += sl.v; }
    const allTime = l && totalAll ? Math.round((l.v / totalAll) * 1000) / 10 : null;
    let recentSelf = 0, recentAll = 0;
    for (const s of songs) {
      const d = s.plays && U.lastFullDelta(s.plays);
      if (d && d.measured) { recentAll += d.gain; if ((s.key) === plays.__key) recentSelf += d.gain; }
    }
    // simpler: compute own recent delta directly
    const own = U.lastFullDelta(plays);
    let recent = null;
    if (own && own.measured) {
      let sumAll = 0;
      for (const s of songs) { const d = s.plays && U.lastFullDelta(s.plays); if (d && d.measured) sumAll += d.gain; }
      recent = sumAll ? Math.round((own.gain / sumAll) * 1000) / 10 : null;
    }
    return { allTime, recent };
  }

  function paceInfo(series) {
    if (!series) return null;
    const d = U.lastFullDelta(series);
    if (!d) return null;
    // compare this week against usual pace: average over all history
    const pts = U.points(series);
    if (pts.length < 3) return { perDay: d.perDay, text: `averaged over ${pts.length} readings` };
    const first = pts[0], last = pts[pts.length - 1];
    const overall = (last.v - first.v) / Math.max(1, U.dayDiff(last.day, first.day));
    const rel = overall > 0 ? d.perDay / overall : null;
    let text;
    if (rel == null) text = 'this week against its usual pace';
    else if (rel > 1.25) text = 'this week is running above its usual pace';
    else if (rel < 0.75) text = 'this week is running below its usual pace';
    else text = 'this week matches its usual pace';
    return { perDay: d.perDay, text };
  }

  function hasDayResolution(series) {
    // Day range only makes sense when consecutive-day readings exist
    const pts = U.points(series);
    for (let i = 1; i < pts.length; i++) if (U.dayDiff(pts[i].day, pts[i - 1].day) === 1) return true;
    return false;
  }

  function rangeWord() {
    return { day: 'daily', week: 'weekly', month: 'monthly', year: 'yearly', all: 'per-month' }[S.range] || 'period';
  }

  function renderChart(kind, item, series, unit) {
    const host = document.getElementById('dChart');
    if (!series || U.points(series).length === 0) {
      host.innerHTML = `<div class="chart-empty"><img src="./assets/myangni-peek.svg" alt="" width="74"/><p><b>No readings yet.</b></p><p>Numbers appear once this release has been observed.</p></div>`;
      return;
    }
    const work = MONSTIEZ.store.workOf(item);
    const notes = ((MONSTIEZ.store.get().catalog || {}).notes || [])
      .filter(n => !work || n.workId === work.id || n.itemId === item.id || n.itemId === item.key);
    const releases = work ? [
      ...work.videos.map(v => ({ day: (v.publishedAt || '').slice(0, 10), label: v.title })),
      ...work.songs.map(s => ({ day: s.releaseDate, label: s.name })),
    ].filter(r => r.day) : [];
    // panning window: 8 points back from the latest, shifted by windowOffset ranges
    const pts = U.points(series);
    const spanDays = S.range === 'all' ? null : { day: 7, week: 28, month: 90, year: 365 }[S.range] || 90;
    const lastDay = pts[pts.length - 1].day;
    let windowEnd = lastDay, windowStart = pts[0].day;
    if (spanDays) {
      windowEnd = U.addDays(lastDay, -S.windowOffset * spanDays);
      windowStart = U.addDays(windowEnd, -spanDays);
      if (windowStart < pts[0].day) windowStart = pts[0].day;
    }
    MONSTIEZ.charts.render(host, {
      points: pts, range: S.range === 'all' ? 'month' : S.range,
      windowStart, windowEnd, releases, notes, unit,
    });
    const winEl = document.getElementById('dWindow');
    if (winEl) {
      winEl.innerHTML = spanDays
        ? `${U.dayShort(windowStart)} – ${U.dayShort(windowEnd)} ${S.windowOffset === 0 ? '· LATEST' : ''}${pts.length < 10 ? ` · only ${pts.length} days so far` : ''}`
        : `${U.dayShort(pts[0].day)} – ${U.dayShort(lastDay)} · everything collected so far`;
    }
    const prev = document.getElementById('dPrev'), next = document.getElementById('dNext');
    if (prev) prev.disabled = windowStart <= pts[0].day;
    if (next) next.disabled = S.windowOffset >= 0;
  }

  function renderMilestones(host, series, unit, kind) {
    if (!host) return;
    if (!series) { host.innerHTML = `<p class="micro-note">No readings yet — milestones appear once a number exists.</p>`; return; }
    const m = U.milestones(series);
    const minHistory = kind === 'v' ? 2 : 5;
    const nextHtml = m.next ? (() => {
      const proj = U.projectMilestone(series, m.next.mark, { minHistoryDays: minHistory });
      const eta = proj.ok ? `about ${proj.days} days — ${proj.month}` : 'no date yet — a date needs a few more days of readings';
      return `<div class="ms-next">
        <div><span>Next mark</span><b>${esc(U.compact(m.next.mark))}</b></div>
        <div><span>To go</span><b>${esc(U.compact(m.next.remaining))}</b></div>
        <div><span>At current pace</span><b>${esc(eta)}</b></div>
      </div>`;
    })() : '';
    const passed = m.passed.slice().reverse().map(p => {
      const dateTxt = p.beforeHistory ? 'before our readings began'
        : p.rangeStart && p.uncertain
          ? `between ${U.dayShort(p.rangeStart)} and ${U.dayShort(p.onDay)}`
          : U.dayLabel(p.onDay);
      return `<div class="ms-item"><b>${esc(U.compact(p.mark))}</b><span>${dateTxt}${p.estimated ? ' · est' : ''}</span></div>`;
    }).join('');
    host.innerHTML = `${nextHtml}
      ${passed ? `<div class="ms-ladder" tabindex="0" aria-label="Milestones already passed, scroll back through history"><div class="ms-track">${passed}</div></div>` : '<p class="micro-note">No round number has been passed during our readings yet — the ladder fills in as collection continues.</p>'}
      <p class="micro-note">Marks are 10M, 20M, 50M, 100M, 150M, 200M and then every 100M — spaced evenly as a list, not a ruler. Estimates are marked est; a mark passed before readings began has no date.</p>`;
  }

  function renderBigDay(host, series, unit, item) {
    if (!host) return;
    const bd = U.biggestDay(series, { startsAtRelease: false });
    if (!bd) {
      host.innerHTML = `<div class="card-title-row"><div><p class="kicker">THE BIGGEST DAY</p><h2>No peak to report yet</h2></div></div>
        <p class="micro-note">The biggest recorded day appears after a few consecutive daily readings. If our history does not go back to the release day, the page says so rather than telling you something untrue.</p>`;
      return;
    }
    host.innerHTML = `<div class="card-title-row"><div><p class="kicker">THE BIGGEST DAY</p><h2>${esc(U.dayLabel(bd.peak.day))}</h2></div></div>
      <div class="bigday-row">
        <div class="d-stat"><b>${esc('+' + U.full(bd.peak.gain))}</b><span>${unit} added on the biggest recorded day</span></div>
        <div class="d-stat"><b>${bd.stillClimbing ? 'Still climbing' : bd.halfLife != null ? bd.halfLife + ' days' : '—'}</b><span>${bd.stillClimbing ? 'no peak yet — the latest day matches or beats it' : 'fell to half the peak in that many days'}</span></div>
      </div>
      ${bd.hasFullHistory ? '' : '<p class="micro-note">Our history does not reach back to release day, so the true biggest day may be earlier than the one recorded here.</p>'}`;
  }

  function vRow(v) {
    const isVideo = Boolean(v.id && v.title);
    const href = isVideo ? `#/release/v/${v.id}` : `#/release/s/${encodeURIComponent(v.key)}`;
    const l = isVideo ? (v.views && U.latest(v.views)) : (v.plays && U.latest(v.plays));
    return `<a class="ver-row" href="${esc(href)}" data-nav="${esc(href.slice(1))}">
      <span class="ver-kind">${isVideo ? esc(tagLabel(v.tag)) : 'RECORDING'}</span>
      <span class="ver-name">${esc(v.title || v.name)}</span>
      <span class="ver-num">${esc(l ? U.compact(l.v) : '—')} ${isVideo ? 'views' : 'plays'}</span>
    </a>`;
  }

  function bindDetail(host, kind, item, series, unit) {
    host.querySelectorAll('[data-range]').forEach(b => b.addEventListener('click', () => {
      S.range = b.dataset.range; S.windowOffset = 0; render(kind, item.id || item.key);
    }));
    const prev = host.querySelector('#dPrev'), next = host.querySelector('#dNext');
    if (prev) prev.addEventListener('click', () => { S.windowOffset++; render(kind, item.id || item.key); });
    if (next) next.addEventListener('click', () => { S.windowOffset = Math.max(0, S.windowOffset - 1); render(kind, item.id || item.key); });
    const more = host.querySelector('#verMore');
    if (more) more.addEventListener('click', () => {
      const hidden = host.querySelector('.ver-hidden');
      if (hidden) { hidden.hidden = false; more.remove(); }
    });
  }

  function loadingHtml() {
    return `<div class="tracker-loading"><img src="./assets/myangni-sleepy.svg" alt="" width="90"/><p>Waking the numbers up…</p></div>`;
  }
  function emptyHtml(msg, kind) {
    return `<div class="tracker-loading"><img src="./assets/myangni-peek.svg" alt="" width="90"/><p>${esc(msg)}</p><a class="secondary-btn" href="#tracker" data-nav="tracker">‹ Back to tracker</a></div>`;
  }

  MONSTIEZ.detail = { render };
})();
