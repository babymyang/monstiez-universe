/* MONSTIEZ Universe — data store
 * Loads static JSON snapshots (data/*.json), keeps last-known-good copies in
 * localStorage, and exposes normalized, provenance-carrying views to the UI.
 * The UI never talks to a platform API directly.
 */
(() => {
  'use strict';
  const MONSTIEZ = (window.MONSTIEZ = window.MONSTIEZ || {});
  const U = MONSTIEZ.util;
  const CACHE_KEY = 'monstiez-data-cache-v1';
  const FILES = {
    catalog: './data/catalog.json',
    youtube: './data/series/youtube.json',
    spotify: './data/series/spotify.json',
    status: './data/feed-status.json',
  };

  let state = {
    loaded: false,
    stale: false,
    loadedAt: null,
    catalog: null,
    youtube: null,
    spotify: null,
    status: null,
  };
  const listeners = [];

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
  }
  function writeCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        savedAt: new Date().toISOString(),
        catalog: state.catalog, youtube: state.youtube, spotify: state.spotify, status: state.status,
      }));
    } catch { /* storage full or unavailable — non-fatal */ }
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    return res.json();
  }

  function validateSeries(obj, label) {
    if (!obj || typeof obj !== 'object') throw new Error(`${label}: not an object`);
    if (!obj.meta || !obj.meta.version) throw new Error(`${label}: missing meta`);
    return true;
  }

  async function load({ force = false } = {}) {
    const cache = force ? null : readCache();
    if (cache && cache.catalog) {
      state.catalog = cache.catalog;
      state.youtube = cache.youtube;
      state.spotify = cache.spotify;
      state.status = cache.status;
      state.loaded = true;
      state.loadedAt = cache.savedAt;
      state.stale = true; // cached copy is presumed stale until fresh fetch succeeds
      emit();
    }
    try {
      const [catalog, youtube, spotify, status] = await Promise.all([
        fetchJson(FILES.catalog), fetchJson(FILES.youtube),
        fetchJson(FILES.spotify), fetchJson(FILES.status).catch(() => null),
      ]);
      validateSeries(youtube, 'youtube'); validateSeries(spotify, 'spotify');
      state.catalog = catalog; state.youtube = youtube; state.spotify = spotify;
      state.status = status || { note: 'No feed-status file present.' };
      state.loaded = true; state.stale = false;
      state.loadedAt = new Date().toISOString();
      writeCache();
      emit();
      return true;
    } catch (err) {
      if (state.loaded) { state.stale = true; emit(); return false; }
      state.error = err.message || 'Could not load tracker data.';
      emit();
      return false;
    }
  }

  function emit() { listeners.forEach(fn => { try { fn(state); } catch {} }); }
  function onChange(fn) { listeners.push(fn); }

  /* ---------- derived models ---------- */

  function videoList() {
    const { catalog, youtube } = state;
    if (!catalog || !youtube) return [];
    return catalog.videos.map(v => {
      const views = (youtube.videos[v.id] && youtube.videos[v.id].views) || null;
      const likes = (youtube.videos[v.id] && youtube.videos[v.id].likes) || null;
      return { kind: 'video', ...v, views, likes };
    });
  }

  function songList() {
    const { catalog, spotify } = state;
    if (!catalog || !spotify) return [];
    return catalog.songs.map(s => {
      const plays = (spotify.tracks[s.key]) || null;
      return { kind: 'song', ...s, plays };
    });
  }

  function videoById(id) { return videoList().find(v => v.id === id) || null; }
  function songByKey(key) { return songList().find(s => s.key === key) || null; }

  function worksIndex() {
    const idx = {};
    for (const w of (state.catalog && state.catalog.works) || []) idx[w.id] = { ...w, videos: [], songs: [] };
    for (const v of videoList()) for (const wid of v.workIds || []) if (idx[wid]) idx[wid].videos.push(v);
    for (const s of songList()) for (const wid of s.workIds || []) if (idx[wid]) idx[wid].songs.push(s);
    return idx;
  }

  function workOf(item) {
    const idx = worksIndex();
    for (const wid of item.workIds || []) if (idx[wid]) return idx[wid];
    return null;
  }

  function channelModel() {
    const ch = state.youtube && state.youtube.channel;
    if (!ch) return null;
    return { id: ch.id, title: ch.title, subscribers: ch.subscribers, views: ch.views };
  }

  function artistModel() {
    const a = state.spotify && state.spotify.artist;
    if (!a) return null;
    return { id: a.id, name: a.name, followers: a.followers, monthlyListeners: a.monthlyListeners };
  }

  function dataAsOf() {
    const out = { youtube: null, spotify: null };
    const ch = channelModel();
    if (ch) {
      const v = U.latest(ch.views), s = U.latest(ch.subscribers);
      out.youtube = v && s ? (v.day > s.day ? v.day : s.day) : (v || s || {}).day;
    }
    const tr = songList();
    let maxDay = null;
    for (const t of tr) { const l = t.plays && U.latest(t.plays); if (l && (!maxDay || l.day > maxDay)) maxDay = l.day; }
    out.spotify = maxDay;
    return out;
  }

  /** Rank map for a list: videoId/songKey -> position (1-based). */
  function rankMap(kind, sortBy = 'totals') {
    const normalized = kind === 'v' || kind === 'video' ? 'video' : 'song';
    const items = normalized === 'video' ? videoList() : songList();
    const metric = (it) => {
      if (normalized === 'video') { const l = it.views && U.latest(it.views); return l ? l.v : -1; }
      const l = it.plays && U.latest(it.plays); return l ? l.v : -1;
    };
    const sorted = [...items].sort((a, b) => metric(b) - metric(a));
    const map = {};
    sorted.forEach((it, i) => { map[it.id || it.key] = i + 1; });
    return map;
  }

  MONSTIEZ.store = {
    load, onChange, get: () => state,
    videoList, songList, videoById, songByKey,
    worksIndex, workOf, channelModel, artistModel, dataAsOf, rankMap,
  };
})();
