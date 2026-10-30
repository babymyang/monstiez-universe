/* MONSTIEZ Universe — Audience, Totals, Compare and Data-sources views.
 * BM Tracker audit parity: F-19 (totals), F-20 (compare), F-21 (audience), F-22 (provenance).
 */
(() => {
  'use strict';
  const MONSTIEZ = (window.MONSTIEZ = window.MONSTIEZ || {});
  const U = MONSTIEZ.util;
  const esc = U.escapeHtml;

  /* ================= AUDIENCE ================= */

  function audience(host) {
    const store = MONSTIEZ.store;
    const st = store.get();
    if (!st.loaded) { host.innerHTML = loading(); return; }
    const panels = [];

    const ch = store.channelModel();
    if (ch) {
      panels.push(audiencePanel({
        platform: 'YouTube', label: 'subscribers', series: ch.subscribers,
        note: 'A rounded figure — it sits still and then steps up, so there is no daily pace to project a date from.',
        colour: '#ff4f9a',
      }));
      panels.push(audiencePanel({
        platform: 'YouTube', label: 'channel views', series: ch.views,
        note: 'The whole channel\u2019s view count — not the tracked videos added up.',
        colour: '#ff8fb8', kind: 'views',
      }));
    }
    const artist = store.artistModel();
    if (artist) {
      panels.push(audiencePanel({
        platform: 'Spotify', label: 'followers', series: artist.followers,
        note: 'An exact number — it rises a little every day, so it gets a real pace and an estimated month once there are enough readings.',
        colour: '#a78bfa', kind: 'followers',
      }));
      panels.push(audiencePanel({
        platform: 'Spotify', label: 'monthly listeners', series: artist.monthlyListeners,
        note: 'Counts only the last 28 days, so it drops as easily as it rises — no milestone, just where it is and its highest reading.',
        colour: '#7cc5f0', kind: 'listeners', noMilestone: true,
      }));
    }
    host.innerHTML = `
      <div class="view-head">
        <a class="back-link" href="#tracker" data-nav="tracker">‹ Tracker</a>
        <h1>Audience</h1>
        <p class="subcopy">Followers, subscribers and listeners — each counted where it is counted. They are never added together: the same person follows in several places, so a grand total would be bigger than the real audience.</p>
      </div>
      <div class="aud-grid">${panels.join('')}</div>
      <p class="micro-note">TikTok, Instagram and X panels appear here once those accounts are added to the daily collection — only real, dated readings are ever shown.</p>`;
  }

  function audiencePanel({ platform, label, series, note, colour, kind, noMilestone }) {
    const l = series && U.latest(series);
    const pts = series ? U.points(series) : [];
    const m = noMilestone ? null : U.milestones(series || {});
    let nextHtml = '';
    if (m && m.next) {
      const proj = U.projectMilestone(series, m.next.mark, { minHistoryDays: 5 });
      nextHtml = `<div class="aud-next"><b>${esc(U.compact(m.next.remaining))}</b> to go to ${esc(U.compact(m.next.mark))}
        <small>${proj.ok ? esc(proj.month) : 'no date yet — a date needs 14 days of readings, and there are ' + pts.length}</small></div>`;
    }
    let highestHtml = '';
    if (noMilestone && pts.length) {
      const hi = pts.reduce((a, b) => (b.v > a.v ? b : a), pts[0]);
      highestHtml = `<div class="aud-next"><small>${pts.length > 1 ? (hi.day === l.day ? 'Its highest reading yet' : `highest: ${esc(U.compact(hi.v))} on ${esc(U.dayShort(hi.day))}`) : `first reading — ${esc(U.dayShort(l.day))}`}</small></div>`;
    }
    return `<section class="card aud-panel">
      <div class="card-title-row"><div><p class="kicker">${esc(platform.toUpperCase())}</p><h2>${esc(U.compact(l ? l.v : null) || '—')} <small>${esc(label)}</small></h2></div></div>
      ${nextHtml || ''}
      ${highestHtml}
      <div class="aud-chart" data-audchart="1"></div>
      <p class="micro-note">${esc(note)}</p>
      <p class="micro-note">${esc(l ? `Source: ${esc(sourceShort(l.source))} · read ${esc(U.dayLabel(l.day))}${l.estimated ? ' · est' : ''}` : 'no reading yet')}</p>
    </section>`;
  }

  function sourceShort(url) {
    if (!url) return 'unknown';
    try { const h = new URL(url).host; return h.includes('bm-tracker') ? 'bm-tracker.com public figures (credited)' : h.includes('kworb') ? 'Kworb' : h; } catch { return url; }
  }

  /* ================= TOTALS ================= */

  function totals(host, platform) {
    const store = MONSTIEZ.store;
    const st = store.get();
    if (!st.loaded) { host.innerHTML = loading(); return; }
    if (platform === 'youtube') {
      const ch = store.channelModel();
      const series = ch && ch.views;
      const l = series && U.latest(series);
      const d = series && U.lastFullDelta(series);
      host.innerHTML = `
        <div class="view-head">
          <a class="back-link" href="#tracker" data-nav="tracker">‹ Tracker</a>
          <h1>YouTube — everything added up</h1>
          <p class="subcopy">The whole channel\u2019s view count. This is not the tracked videos added up — only some of the channel\u2019s videos are followed here, so the two are far apart.</p>
        </div>
        <section class="card">
          <div class="total-hero"><span class="total-label">TOTAL VIEWS</span><strong>${esc(U.full(l ? l.v : null) || '—')}</strong>
          <span class="total-meta">${d ? esc(U.delta(d.gain)) + ' on ' + esc(U.dayShort(d.day)) + (d.measured ? '' : ' · est') : 'read ' + esc(U.daysAgoLabel(l && l.day))}</span></div>
          <div id="totalsChart"></div>
          <p class="micro-note">${l ? `Source: ${esc(sourceShort(l.source))} · observed ${esc(U.dayLabel(l.day))}` : 'no reading yet'}</p>
        </section>`;
      const chartHost = host.querySelector('#totalsChart');
      if (series) MONSTIEZ.charts.render(chartHost, { points: U.points(series), range: 'month', unit: 'views' });
      return;
    }
    // spotify: sum of listed songs
    const songs = store.songList();
    const perDay = new Map();
    for (const s of songs) {
      for (const [day, rec] of Object.entries(s.plays || {})) {
        perDay.set(day, (perDay.get(day) || 0) + rec.v);
      }
    }
    const series = {};
    [...perDay.entries()].sort().forEach(([day, v]) => { series[day] = { v, estimated: false, source: 'sum of listed tracks (each with its own source)', method: 'derived-sum' }; });
    const pts = U.points(series);
    const l = pts.length ? pts[pts.length - 1] : null;
    const prev = pts.length > 1 ? pts[pts.length - 2] : null;
    host.innerHTML = `
      <div class="view-head">
        <a class="back-link" href="#tracker" data-nav="tracker">‹ Tracker</a>
        <h1>Spotify — everything added up</h1>
        <p class="subcopy">Every listed recording added together. A song that has stopped growing still carries its whole total along, so this answers whether the whole collection is still growing — not what any single page shows.</p>
      </div>
      <section class="card">
        <div class="total-hero"><span class="total-label">TOTAL PLAYS</span><strong>${esc(U.full(l ? l.v : null) || '—')}</strong>
        <span class="total-meta">${l && prev ? esc(U.delta(l.v - prev.v)) + ' across the last two readings' : 'sum of listed songs'}</span></div>
        <div id="totalsChart"></div>
        <p class="micro-note">Each day sums that day\u2019s per-track readings (Kworb and credited public observations). Days absent from every source simply do not appear.</p>
      </section>`;
    const chartHost = host.querySelector('#totalsChart');
    if (pts.length) MONSTIEZ.charts.render(chartHost, { points: pts, range: 'month', unit: 'plays' });
  }

  /* ================= COMPARE ================= */

  const COMPARE_COLOURS = ['#ff4f9a', '#a78bfa', '#7cc5f0', '#f0a35c', '#7ed6a5', '#e58cc4'];

  function compare(host, fromKind, fromId) {
    const store = MONSTIEZ.store;
    const st = store.get();
    if (!st.loaded) { host.innerHTML = loading(); return; }
    const isVideo = fromKind === 'v';
    const pool = isVideo ? store.videoList() : store.songList();
    const from = isVideo ? store.videoById(fromId) : store.songByKey(fromId);
    if (!from) { host.innerHTML = `<div class="view-head"><p>That release is not in the tracked set.</p></div>`; return; }

    // selection kept in module state
    COMP.selected = COMP.selected || new Map();
    const sel = COMP.selected;
    const key = (x) => x.id || x.key;
    sel.set(key(from), from);

    const seriesOf = (x) => isVideo ? x.views : x.plays;
    const startOf = (x) => isVideo ? (x.publishedAt || '').slice(0, 10) : x.releaseDate;
    const list = [...sel.values()];
    const seriesList = list.map((x, i) => ({
      name: x.title || x.name, colour: COMPARE_COLOURS[i % COMPARE_COLOURS.length],
      points: U.points(seriesOf(x) || {}), startDay: startOf(x),
    })).filter(s => s.startDay);

    const marks = [10e6, 20e6, 50e6, 100e6, 150e6, 200e6, 300e6, 400e6, 500e6, 1e9];
    const tableRows = marks.map(mark => {
      const cells = list.map(x => {
        const pts = U.points(seriesOf(x) || {}).filter(p => p.day >= startOf(x));
        const hit = pts.find(p => p.v >= mark);
        if (!hit) return `<td>·</td>`;
        const age = U.dayDiff(hit.day, startOf(x));
        return `<td>${age}d</td>`;
      }).join('');
      return `<tr><th>${esc(U.compact(mark))}</th>${cells}</tr>`;
    }).join('');

    host.innerHTML = `
      <div class="view-head">
        <a class="back-link" href="#tracker" data-nav="tracker">‹ Tracker</a>
        <h1>Compare</h1>
        <p class="subcopy">Releases side by side, counted from the day each one came out — so you compare them fairly instead of favouring whichever has been out the longest. ${isVideo ? 'Videos compare with videos' : 'Songs compare with songs'}; views and plays are never drawn on the same chart.</p>
      </div>
      <section class="card">
        <div class="card-title-row"><div><p class="kicker">AGE-ALIGNED</p><h2>${esc(from.title || from.name)} and company</h2></div></div>
        <div id="compareChart"></div>
        <p class="micro-note">Up to six releases fit on one chart. The summary is written about the release you started from.</p>
      </section>
      <section class="card">
        <div class="card-title-row"><div><p class="kicker">DAYS TO EACH MARK</p><h2>Milestone race</h2></div></div>
        <div class="table-wrap"><table class="cmp-table"><thead><tr><th>Mark</th>${list.map(x => `<th>${esc(shortName(x))}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table></div>
        <p class="micro-note">A blank dot means the release has not got there yet, or got there before our readings begin.</p>
      </section>
      <section class="card">
        <div class="card-title-row"><div><p class="kicker">ADD A RELEASE</p><h2>Pick one to add</h2></div></div>
        <div class="cmp-pick">${pool.filter(x => !sel.has(key(x))).slice(0, 12).map(x =>
          `<button class="chip" data-add="${esc(key(x))}">+ ${esc(shortName(x))}</button>`).join('') || '<p class="micro-note">All releases are already on the chart.</p>'}</div>
      </section>`;

    const chartHost = host.querySelector('#compareChart');
    MONSTIEZ.charts.renderCompare(chartHost, seriesList, { unit: isVideo ? 'views' : 'plays', maxDay: 150 });
    host.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
      const item = pool.find(x => key(x) === b.dataset.add);
      if (item && sel.size < 6) { sel.set(key(item), item); compare(host, fromKind, fromId); }
      else if (sel.size >= 6) MONSTIEZ.app.toast('Six releases fit on one chart.');
    }));
  }

  function shortName(x) {
    const n = (x.title || x.name || '').replace(/^BABYMONSTER\s*-\s*/, '').replace(/[|'].*/g, '').trim();
    return n.length > 18 ? n.slice(0, 17) + '…' : n;
  }

  /* ================= SOURCES ================= */

  function sources(host) {
    const store = MONSTIEZ.store;
    const st = store.get();
    const cat = st.catalog || {};
    host.innerHTML = `
      <div class="view-head">
        <a class="back-link" href="#tracker" data-nav="tracker">‹ Tracker</a>
        <h1>Where the numbers come from</h1>
        <p class="subcopy">Every figure here is a dated observation of a number that a platform or a public record-keeper published. Nothing is guessed, and nothing is presented as an official Spotify or YouTube API response unless it really is one.</p>
      </div>
      <section class="card">
        <div class="card-title-row"><div><p class="kicker">PROVIDERS</p><h2>Current sources</h2></div></div>
        <ul class="src-list">
          <li><b>YouTube views, likes, subscribers</b> — official <span>YouTube Data API</span> (when a key is configured in GitHub Actions) or dated manual observations of public pages. Historical YouTube values exist only from the day collection started; nothing older is reconstructed.</li>
          <li><b>Spotify play counts</b> — <span>Kworb</span> public artist page (third-party public stream figures; robots.txt permits access; credited on every figure). The Spotify Web API does not publish stream totals, so no figure here is ever labelled as one.</li>
          <li><b>Spotify followers & monthly listeners</b> — dated public observations (credited).</li>
          <li><b>Catalogue metadata</b> — video IDs, titles, release dates and artwork are public platform metadata.</li>
        </ul>
        <p class="micro-note">Seed observations on 2026-10-30 were taken from bm-tracker.com\u2019s public figures with credit — BM Tracker is an independent project and MONSTIEZ Universe is not affiliated with it. Ongoing collection is independent.</p>
      </section>
      <section class="card">
        <div class="card-title-row"><div><p class="kicker">WORDS YOU WILL SEE</p><h2>Glossary</h2></div></div>
        <dl class="gloss">
          <dt>est · Estimate</dt><dd>That day had to be read across a gap, so the number next to it is an estimate. It is always marked.</dd>
          <dt>No count</dt><dd>No number was published. It means missing, not zero.</dd>
          <dt>New · No full day</dt><dd>There is not a complete day to measure yet, so there is no daily number to show.</dd>
          <dt>KST</dt><dd>Korea time — a day in this app is a Korea day, because that is where the music comes out.</dd>
          <dt>Last collected</dt><dd>A warning that the numbers are older than they should be. They are still real numbers, just not fresh ones.</dd>
        </dl>
      </section>
      <section class="card">
        <div class="card-title-row"><div><p class="kicker">HONESTY RULES</p><h2>What this app will never do</h2></div></div>
        <ul class="src-list">
          <li>Never fill a missing number with a made-up zero.</li>
          <li>Never invent history for periods before collection began.</li>
          <li>Never present a third-party figure as an official API response.</li>
          <li>Never add views and plays together — they count different things.</li>
        </ul>
        <p class="micro-note">MONSTIEZ Universe is a fan-made, unofficial companion and is not affiliated with BABYMONSTER, YG Entertainment, YouTube, Spotify, BM Tracker, Kworb or any other data provider.</p>
      </section>`;
  }

  function loading() {
    return `<div class="tracker-loading"><img src="./assets/myangni-sleepy.svg" alt="" width="90"/><p>Waking the numbers up…</p></div>`;
  }

  const COMP = { selected: null };

  /* hook charts to audience panels after render */
  const origAudience = audience;
  function audienceWithCharts(host) {
    origAudience(host);
    const store = MONSTIEZ.store;
    const ch = store.channelModel(), artist = store.artistModel();
    const charts = host.querySelectorAll('[data-audchart]');
    const seriesSet = [];
    if (ch) { seriesSet.push(ch.subscribers, ch.views); }
    if (artist) { seriesSet.push(artist.followers, artist.monthlyListeners); }
    charts.forEach((el, i) => {
      const s = seriesSet[i];
      if (s && U.points(s).length >= 2) {
        MONSTIEZ.charts.render(el, { points: U.points(s), range: 'all', unit: 'readings' });
      } else {
        el.innerHTML = `<div class="chart-empty"><img src="./assets/myangni-peek.svg" alt="" width="64"/><p>History builds up here as daily readings accumulate.</p></div>`;
      }
    });
  }

  MONSTIEZ.views = { audience: audienceWithCharts, totals, compare, sources };
})();
