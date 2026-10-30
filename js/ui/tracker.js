/* MONSTIEZ Universe — tracker lists (YouTube / Spotify tabs).
 * Feature parity sources (BM Tracker audit IDs): F-01..F-10.
 * MONSTIEZ design language; every figure carries source + date.
 */
(() => {
  'use strict';
  const MONSTIEZ = (window.MONSTIEZ = window.MONSTIEZ || {});
  const U = MONSTIEZ.util;
  const esc = U.escapeHtml;

  const S = {
    platform: 'youtube',
    sort: { youtube: 'newest', spotify: 'newest' },
    query: { youtube: '', spotify: '' },
    channel: 'all',
    tag: 'all',
  };

  const TAG_ABBR = {
    music_video: 'MV', performance: 'PF', music_show: 'MS',
    dance_performance: 'DP', cover: 'CV', dance_cover: 'DC', variety: 'VY',
  };

  function init(root, { onOpenRelease }) {
    S.onOpenRelease = onOpenRelease;
    return { render };
  }

  /* ---------- helpers ---------- */

  function latestOf(it) {
    const series = S.platform === 'youtube' ? it.views : it.plays;
    return series ? U.latest(series) : null;
  }

  function deltaOf(it) {
    const series = S.platform === 'youtube' ? it.views : it.plays;
    return series ? U.lastFullDelta(series) : null;
  }

  function rankChangeOf(it, ranks) {
    // needs 7+ days of history on enough items; otherwise hidden
    const series = S.platform === 'youtube' ? it.views : it.plays;
    if (!series) return null;
    const id = it.id || it.key;
    const now = ranks.today[id];
    const week = ranks.week[id];
    if (!now || !week) return null;
    return { diff: week - now }; // positive = moved up
  }

  function computeRanks(items) {
    const metric = (it) => { const l = latestOf(it); return l ? l.v : -1; };
    const weekMetric = (it) => {
      const series = S.platform === 'youtube' ? it.views : it.plays;
      if (!series) return null;
      const today = U.kstDay();
      const target = U.addDays(today, -7);
      const days = U.seriesDays(series);
      let best = null;
      for (const d of days) { if (d <= target) best = d; else break; }
      return best ? series[best].v : null;
    };
    const mk = (fn) => {
      const sorted = [...items].map(it => ({ id: it.id || it.key, v: fn(it) }))
        .filter(x => x.v != null && x.v >= 0)
        .sort((a, b) => b.v - a.v);
      const map = {};
      sorted.forEach((x, i) => { map[x.id] = i + 1; });
      return map;
    };
    return { today: mk(metric), week: mk(weekMetric) };
  }

  /* ---------- header ---------- */

  function headerHtml() {
    const store = MONSTIEZ.store;
    if (S.platform === 'youtube') {
      const ch = store.channelModel();
      if (!ch) return '';
      const subs = U.latest(ch.subscribers);
      const views = U.latest(ch.views);
      const viewsDelta = U.lastFullDelta(ch.views);
      const subsNote = subs && subs.precision === 'rounded'
        ? 'rounded figure — sits still, then steps up'
        : '';
      return `
        <a class="aud-line" href="#audience" data-nav="audience">
          <b>${esc(U.compact(subs ? subs.v : null) || '—')}</b> subscribers
          <small>${subsNote || (subs ? 'read ' + U.daysAgoLabel(subs.day) : 'no reading yet')}</small>
        </a>
        <a class="total-line" href="#totals/youtube" data-nav="totals/youtube">
          <span class="total-label">TOTAL VIEWS</span>
          <strong>${esc(U.full(views ? views.v : null) || '—')}</strong>
          <span class="total-meta">${viewsDelta && viewsDelta.measured ? '+' + U.full(viewsDelta.gain) + ' on ' + U.dayShort(viewsDelta.day) : views ? 'read ' + U.daysAgoLabel(views.day) : 'no reading yet'}</span>
        </a>`;
    }
    const artist = store.artistModel();
    if (!artist) return '';
    const fol = U.latest(artist.followers);
    const lis = U.latest(artist.monthlyListeners);
    const totalPlays = sumPlays();
    const playsDelta = totalPlays.delta;
    return `
      <a class="aud-line" href="#audience" data-nav="audience">
        <b>${esc(U.full(fol ? fol.v : null) || '—')}</b> followers
        <small>${esc(lis ? U.compact(lis.v) + ' monthly listeners · ' + U.daysAgoLabel(lis.day) : 'no reading yet')}</small>
      </a>
      <a class="total-line" href="#totals/spotify" data-nav="totals/spotify">
        <span class="total-label">TOTAL PLAYS</span>
        <strong>${esc(U.full(totalPlays.value) || '—')}</strong>
        <span class="total-meta">${playsDelta ? esc(U.delta(playsDelta.gain)) + ' on ' + U.dayShort(playsDelta.day) : 'sum of listed songs'}</span>
      </a>`;
  }

  function sumPlays() {
    const items = MONSTIEZ.store.songList();
    let value = 0, any = false;
    let latestDay = null;
    for (const it of items) {
      const l = it.plays && U.latest(it.plays);
      if (l) { value += l.v; any = true; if (!latestDay || l.day > latestDay) latestDay = l.day; }
    }
    // platform delta = sum of per-track full-day deltas where measured
    let gain = 0, gainDay = null, measuredCount = 0;
    for (const it of items) {
      const d = it.plays && U.lastFullDelta(it.plays);
      if (d && d.measured) { gain += d.gain; measuredCount++; if (!gainDay || d.day > gainDay) gainDay = d.day; }
    }
    return {
      value: any ? value : null,
      delta: measuredCount > 0 ? { gain, day: gainDay, measured: measuredCount >= 3 } : null,
      day: latestDay,
    };
  }

  /* ---------- milestone cards ---------- */

  function milestoneCards() {
    const items = S.platform === 'youtube' ? MONSTIEZ.store.videoList() : MONSTIEZ.store.songList();
    const upcoming = [];
    for (const it of items) {
      const series = S.platform === 'youtube' ? it.views : it.plays;
      if (!series) continue;
      const m = U.milestones(series);
      if (!m.next) continue;
      const kind = S.platform === 'youtube' ? 'views' : 'plays';
      const proj = U.projectMilestone(series, m.next.mark, { minHistoryDays: S.platform === 'youtube' ? 2 : 5 });
      upcoming.push({
        it, mark: m.next.mark, remaining: m.next.remaining, proj,
        label: it.title || it.name,
        href: S.platform === 'youtube' ? `#/release/v/${it.id}` : `#/release/s/${encodeURIComponent(it.key)}`,
      });
    }
    upcoming.sort((a, b) => (a.remaining / (a.mark || 1)) - (b.remaining / (b.mark || 1)));
    return upcoming.slice(0, 2).map(u => `
      <a class="m-card" href="${esc(u.href)}" data-nav="${esc(u.href.slice(1))}">
        <span class="m-name">${esc(u.label)}</span>
        <span class="m-mark">${esc(U.compact(u.mark))}</span>
        <span class="m-go"><b>${esc(U.compact(u.remaining))}</b> to go</span>
        <span class="m-eta">${u.proj && u.proj.ok ? `about ${u.proj.days} days` : 'no pace yet'}</span>
      </a>`).join('');
  }

  /* ---------- controls ---------- */

  function controlsHtml(items) {
    const sorts = S.platform === 'youtube'
      ? [['newest', 'Newest'], ['movement', 'Movement'], ['totals', 'Totals']]
      : [['albums', 'Albums'], ['movement', 'Movement'], ['totals', 'Totals']];
    return `
      <div class="seg-row" role="tablist" aria-label="Reading mode">
        ${sorts.map(([v, l]) => `<button role="tab" aria-selected="${S.sort[S.platform] === v}" class="${S.sort[S.platform] === v ? 'selected' : ''}" data-sort="${v}">${l}</button>`).join('')}
      </div>
      <div class="search-box"><span>⌕</span>
        <input type="search" id="trackerSearch" placeholder="${S.platform === 'youtube' ? 'Search videos' : 'Search recordings'}" value="${esc(S.query[S.platform])}" aria-label="Search releases"/>
        <button id="trackerSearchClear" aria-label="Clear search">×</button>
      </div>
      <div class="chip-row" id="trackerChips">${chipsHtml(items)}</div>`;
  }

  function chipsHtml(items) {
    if (S.platform === 'youtube') {
      const store = MONSTIEZ.store;
      const chans = new Map([['all', items.length]]);
      for (const v of items) {
        const name = v.channel || 'Other';
        chans.set(name, (chans.get(name) || 0) + 1);
      }
      const tags = new Map([['all', items.length]]);
      for (const v of items) tags.set(v.tag, (tags.get(v.tag) || 0) + 1);
      const chanOpts = [...chans.entries()].map(([name, n]) =>
        `<option value="${esc(name)}" ${S.channel === name ? 'selected' : ''}>${esc(name === 'all' ? 'All channels' : name)} (${n})</option>`).join('');
      const tagBtns = [...tags.entries()].sort((a, b) => b[1] - a[1]).map(([tag, n]) =>
        `<button class="chip ${S.tag === tag ? 'active' : ''}" data-tag="${esc(tag)}">${esc(tag === 'all' ? 'All tags' : (TAG_ABBR[tag] ? labelFor(tag) : labelFor(tag)))} <small>${n}</small></button>`).join('');
      return `<label class="chan-select"><select aria-label="Channel">${chanOpts}</select></label><div class="chip-wrap">${tagBtns}</div>`;
    }
    return `<div class="chip-wrap album-note">Songs are grouped under the record they came out on when <b>Albums</b> is selected.</div>`;
  }

  function labelFor(tag) {
    const t = (MONSTIEZ.store.get().catalog && MONSTIEZ.store.get().catalog.tags || []).find(t => t.slug === tag);
    return t ? t.label : tag;
  }

  /* ---------- rows ---------- */

  function rowHtml(it, ranks) {
    const store = MONSTIEZ.store;
    if (S.platform === 'youtube') {
      const l = latestOf(it), d = deltaOf(it);
      const ranksMap = ranks;
      const rank = ranksMap.today[it.id];
      const rc = rankChangeOf(it, ranksMap);
      const tagLabel = labelFor(it.tag);
      const state = valueState(l, d);
      const href = `#/release/v/${it.id}`;
      const wide = window.matchMedia('(min-width: 720px)').matches;
      return `
      <article class="t-row" data-href="${esc(href)}">
        <span class="t-pos">${rank ? rank : '·'}</span>
        <a class="t-thumb" href="https://www.youtube.com/watch?v=${esc(it.id)}" target="_blank" rel="noopener" aria-label="Open ${esc(it.title)} on YouTube">
          <img src="${esc(it.thumb)}" alt="" loading="lazy" onerror="this.classList.add('broken')"/>
          <span class="t-ext">↗</span>
        </a>
        <div class="t-main">
          <a class="t-title" href="${esc(href)}" data-nav="release/v/${esc(it.id)}">${esc(it.title)}</a>
          <span class="t-sub">${esc(tagLabel)} · ${esc(it.channel)}</span>
          ${wide ? sparkHtml(it.views) : ''}
        </div>
        <div class="t-nums">
          <strong class="${state.cls}">${state.gain}</strong>
          <small>${state.total}</small>
          ${rc && rc.diff ? `<small class="t-rank ${rc.diff > 0 ? 'up' : 'down'}">${rc.diff > 0 ? '▲' + rc.diff : '▼' + (-rc.diff)}</small>` : ''}
        </div>
      </article>`;
    }
    // spotify
    const l = latestOf(it), d = deltaOf(it);
    const state = valueState(l, d);
    const href = `#/release/s/${encodeURIComponent(it.key)}`;
    return `
      <article class="t-row" data-href="${esc(href)}">
        <span class="t-cover" aria-hidden="true">${it.cover ? `<img src="${esc(it.cover)}" alt="" loading="lazy" onerror="this.style.display='none'"/>` : '♪'}</span>
        <div class="t-main">
          <a class="t-title" href="${esc(href)}" data-nav="release/s/${esc(it.key)}">${esc(it.name)}</a>
          <span class="t-sub">${esc(it.album)} · ${esc(U.dayShort(it.releaseDate))}</span>
          ${S.sort.spotify === 'albums' ? '' : sparkHtml(it.plays)}
        </div>
        <div class="t-nums">
          <strong class="${state.cls}">${state.gain}</strong>
          <small>${state.total}</small>
        </div>
      </article>`;
  }

  function valueState(l, d) {
    if (!l) return { gain: 'No count', total: '—', cls: 'word' };
    const total = U.full(l.v);
    if (!d) return { gain: l.day >= U.kstDay() || U.seriesDays(latestSeries(l)).length < 2 ? 'New' : 'No full day', total, cls: 'word' };
    if (d.measured) return { gain: '+' + U.full(d.gain), total, cls: 'num' };
    return { gain: 'est +' + U.full(d.gain), total, cls: 'num est' };
  }

  function latestSeries(rec) { return rec; }

  function sparkHtml(series) {
    if (!series) return '';
    const pts = U.points(series).slice(-7);
    if (pts.length < 2) return '';
    const vals = pts.map(p => p.v);
    const min = Math.min(...vals), max = Math.max(...vals);
    const path = pts.map((p, i) => {
      const x = (i / (pts.length - 1)) * 64 + 2;
      const yy = 20 - ((p.v - min) / (max - min || 1)) * 16;
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${yy.toFixed(1)}`;
    }).join(' ');
    return `<svg class="t-spark" viewBox="0 0 68 22" aria-hidden="true"><path d="${path}" fill="none" stroke="#ff4f9a" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  /* ---------- main render ---------- */

  function render() {
    const root = document.getElementById('trackerRoot');
    if (!root) return;
    const store = MONSTIEZ.store;
    const st = store.get();
    if (!st.loaded) {
      root.innerHTML = `<div class="tracker-loading"><img src="./assets/myangni-sleepy.svg" alt="" width="90"/><p>Waking the numbers up…</p></div>`;
      return;
    }
    if (st.error && !st.catalog) {
      root.innerHTML = `<div class="tracker-loading"><img src="./assets/myangni-peek.svg" alt="" width="90"/><p><b>Tracker data could not be loaded.</b></p><p class="micro-note">${esc(st.error)}</p><p class="micro-note">The app shell still works — this only affects live tracker figures.</p></div>`;
      return;
    }

    const items = S.platform === 'youtube' ? store.videoList() : store.songList();
    let visible = items;
    if (S.platform === 'youtube') {
      if (S.channel !== 'all') visible = visible.filter(v => (v.channel || 'Other') === S.channel);
      if (S.tag !== 'all') visible = visible.filter(v => v.tag === S.tag);
    }
    const q = S.query[S.platform].trim().toLowerCase();
    if (q) visible = visible.filter(v => `${v.title || v.name} ${v.album || ''} ${v.channel || ''}`.toLowerCase().includes(q));

    const sort = S.sort[S.platform];
    const dateOf = (it) => S.platform === 'youtube' ? it.publishedAt : it.releaseDate;
    if (sort === 'newest') visible.sort((a, b) => (dateOf(b) || '').localeCompare(dateOf(a) || ''));
    else if (sort === 'movement') visible.sort((a, b) => (deltaOf(b) ? deltaOf(b).perDay : -1) - (deltaOf(a) ? deltaOf(a).perDay : -1));
    else if (sort === 'totals') visible.sort((a, b) => (latestOf(b) ? latestOf(b).v : -1) - (latestOf(a) ? latestOf(a).v : -1));
    else if (sort === 'albums') {
      visible.sort((a, b) => (a.albumId + String(a.trackNo || 0).padStart(3, '0')).localeCompare(b.albumId + String(b.trackNo || 0).padStart(3, '0')));
    }

    const ranks = computeRanks(visible.length ? visible : items);
    const asOf = store.dataAsOf();
    const stale = st.stale;

    // Spotify Albums sort: group rows under the record they came out on, each heading with its own total.
    let listHtml;
    if (S.platform === 'spotify' && sort === 'albums') {
      const groups = [];
      let cur = null;
      for (const it of visible) {
        if (!cur || cur.albumId !== it.albumId) { cur = { albumId: it.albumId, album: it.album, type: it.albumType, date: it.releaseDate, items: [] }; groups.push(cur); }
        cur.items.push(it);
      }
      listHtml = groups.map(g => {
        let total = 0, any = false;
        for (const it of g.items) { const l = latestOf(it); if (l) { total += l.v; any = true; } }
        const rows = g.items.map(it => rowHtml(it, ranks)).join('');
        return `<div class="album-group">
          <a class="album-head" href="https://open.spotify.com/album/${esc(g.albumId)}" target="_blank" rel="noopener">
            <span class="album-name">${esc(g.album)}</span>
            <span class="album-meta">${esc(g.type || 'Record')} · ${esc(U.dayShort(g.date))}</span>
            <span class="album-total">${esc(any ? U.compact(total) + ' plays' : '—')}</span>
          </a>${rows}</div>`;
      }).join('');
    } else {
      listHtml = visible.map(it => rowHtml(it, ranks)).join('');
    }

    root.innerHTML = `
      ${stale ? `<div class="stale-bar" role="status">⏳ Showing your last saved numbers — the fresh copy could not be reached just now.</div>` : ''}
      ${headerHtml()}
      <div class="m-card-row">${milestoneCards() || `<div class="m-empty">Milestone cards appear as readings accumulate.</div>`}</div>
      <p class="as-of">Days are Korea days (KST) · YouTube as of ${esc(U.dayShort(asOf.youtube) || '—')} · Spotify as of ${esc(U.dayShort(asOf.spotify) || '—')} · <a href="#sources" data-nav="sources">where numbers come from</a></p>
      ${controlsHtml(items)}
      <div class="t-head"><span></span><span>${S.platform === 'youtube' ? 'RELEASE' : 'RECORDING'}</span><span>DAY · TOTAL</span></div>
      <div class="t-list">${visible.length ? listHtml
        : `<div class="tracker-loading"><img src="./assets/myangni-peek.svg" alt="" width="84"/><p>Nothing matches that search or filter.</p></div>`}</div>
      <p class="list-note">${visible.length} of ${items.length} ${S.platform === 'youtube' ? 'videos' : 'recordings'} shown · figures are dated observations with their own sources — see <a href="#sources" data-nav="sources">data sources</a>.</p>
    `;

    bind(root);
  }

  function bind(root) {
    root.querySelectorAll('[data-sort]').forEach(b => b.addEventListener('click', () => {
      S.sort[S.platform] = b.dataset.sort; render();
    }));
    const search = root.querySelector('#trackerSearch');
    if (search) {
      search.addEventListener('input', () => { S.query[S.platform] = search.value; render(); const s2 = root.querySelector('#trackerSearch'); if (s2) { s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); } });
      const clear = root.querySelector('#trackerSearchClear');
      if (clear) clear.addEventListener('click', () => { S.query[S.platform] = ''; render(); });
    }
    const chan = root.querySelector('select[aria-label="Channel"]');
    if (chan) chan.addEventListener('change', () => { S.channel = chan.value; render(); });
    root.querySelectorAll('[data-tag]').forEach(b => b.addEventListener('click', () => {
      S.tag = b.dataset.tag; render();
    }));
    root.querySelectorAll('[data-href]').forEach(row => row.addEventListener('click', (e) => {
      if (e.target.closest('a') && e.target.closest('a').target === '_blank') return;
      const href = row.dataset.href;
      if (href && S.onOpenRelease) { e.preventDefault(); S.onOpenRelease(href); }
    }));
  }

  function setPlatform(p) { S.platform = p === 'spotify' ? 'spotify' : 'youtube'; }
  function getPlatform() { return S.platform; }

  MONSTIEZ.tracker = { init, render, setPlatform, getPlatform, valueState };
})();
