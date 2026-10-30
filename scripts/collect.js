#!/usr/bin/env node
/* Daily collector — MONSTIEZ Universe tracker data.
 *
 * Runs in GitHub Actions (scheduled or workflow_dispatch). Writes dated reading
 * entries into data/series/*.json. Commits happen in the workflow only when values change.
 *
 * Sources:
 *  1. Kworb public artist page (Spotify per-track play totals) — robots.txt: Allow: /
 *     No secrets needed. Figures are third-party public stream figures.
 *  2. YouTube Data API v3 (official) — only when YOUTUBE_API_KEY is set.
 *     Quota-efficient: channels.list (1u) → playlistItems.list pages (1u each) →
 *     videos.list batches of 50 (1u each). No search.list polling.
 *
 * Honesty rules: a reading is appended only for the day it was actually observed.
 * Nothing older is ever reconstructed; conflicting same-day readings keep both
 * values (new primary + previous as alt) when they disagree.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const YOUTUBE_CHANNEL_ID = process.env.BABYMONSTER_CHANNEL_ID || 'UCqwUnggBBct-AY2lAdI88jQ'; // verified from official page + BM Tracker channels list
const KWORB_URL = 'https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS_songs.html';
const ARTIST_ID = '1SIocsqdEefUTE6XKGUiVS';
const TODAY_KST = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const NOW_ISO = new Date().toISOString();

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 1));
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'MONSTIEZUniverseFanPWA/1.0 (fan tracker; repo: github.com/babymyang/monstiez-universe)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/* ---------------- Kworb (Spotify plays) ---------------- */

function parseKworbSongs(html) {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(m => m[1]);
  const tracks = [];
  for (const r of rows) {
    const m = r.match(/href="https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<td>([\d,]+)<\/td><td>([\d,]+)<\/td>/);
    if (!m) continue;
    tracks.push({
      trackId: m[1],
      title: m[2].replace(/<[^>]+>/g, '').trim(),
      total: parseInt(m[3].replace(/,/g, ''), 10),
      daily: parseInt(m[4].replace(/,/g, ''), 10),
    });
  }
  const upd = html.match(/Last updated:\s*([\d/]+)/);
  return { tracks, updatedAt: upd ? upd[1].trim() : null };
}

async function collectKworb() {
  const html = await fetchText(KWORB_URL);
  const { tracks, updatedAt } = parseKworbSongs(html);
  if (!tracks.length) throw new Error('Kworb parse produced 0 tracks — page layout may have changed.');
  // Honesty: file the reading under the day the page itself declares ("Last updated"),
  // never under the collection day — otherwise a stale page would fabricate a flat extra day.
  let readingDay = TODAY_KST;
  if (updatedAt) {
    const m = updatedAt.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (m) readingDay = `${m[1]}-${m[2]}-${m[3]}`;
  }
  const spPath = path.join(DATA, 'series', 'spotify.json');
  const sp = readJson(spPath);
  const catalog = readJson(path.join(DATA, 'catalog.json'));
  const byTrackId = {};
  for (const s of catalog.songs) byTrackId[s.trackId] = s.key;

  let appended = 0, changed = 0, conflicts = 0, alreadySame = 0;
  for (const t of tracks) {
    const key = byTrackId[t.trackId];
    if (!key) continue; // Kworb may list tracks outside our curated set
    const days = sp.tracks[key] = sp.tracks[key] || {};
    const existing = days[readingDay];
    if (existing && existing.v === t.total) { alreadySame++; continue; }
    if (existing && existing.v !== t.total) {
      // same-day disagreement: keep the newer reading, preserve the earlier one as alt
      existing.alt = { v: existing.v, source: existing.source, method: existing.method };
      conflicts++;
    }
    days[readingDay] = {
      v: t.total, estimated: false,
      source: KWORB_URL, method: 'public-page-parse',
      daily: t.daily,
      note: `Kworb public page (third-party public stream figures), page dated ${readingDay}.`,
    };
    changed++;
  }
  sp.meta.lastCollection = NOW_ISO;
  sp.meta.kworbUpdatedAt = updatedAt || sp.meta.kworbUpdatedAt;
  sp.meta.lastReadingDay = readingDay;
  writeJson(spPath, sp);
  return { tracks: tracks.length, readingDay, changed, alreadySame, conflicts };
}

/* ---------------- YouTube Data API (official) ---------------- */

async function apiGet(endpoint, params, key) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('key', key);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`YouTube API ${endpoint} → ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function collectYouTube() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { skipped: true, reason: 'YOUTUBE_API_KEY not configured — official collection pending; dated manual observations remain in the series.' };
  const ytPath = path.join(DATA, 'series', 'youtube.json');
  const yt = readJson(ytPath);

  // 1 unit: channel snippet/statistics/contentDetails
  const ch = await apiGet('channels', { part: 'snippet,statistics,contentDetails', id: YOUTUBE_CHANNEL_ID }, key);
  if (!ch.items || !ch.items.length) throw new Error('Channel not found for ' + YOUTUBE_CHANNEL_ID);
  const channel = ch.items[0];
  yt.channel = yt.channel || { id: YOUTUBE_CHANNEL_ID, title: channel.snippet.title, subscribers: {}, views: {}, videos: {} };
  const subs = channel.statistics.subscriberCount;
  const hiddenSubs = Boolean(channel.statistics.hiddenSubscriberCount);
  if (!hiddenSubs) {
    yt.channel.subscribers[TODAY_KST] = {
      v: parseInt(subs, 10), estimated: false, precision: 'exact',
      source: 'https://www.googleapis.com/youtube/v3/channels', method: 'official-youtube-data-api',
    };
  }
  yt.channel.views[TODAY_KST] = {
    v: parseInt(channel.statistics.viewCount, 10), estimated: false,
    source: 'https://www.googleapis.com/youtube/v3/channels', method: 'official-youtube-data-api',
  };

  // uploads playlist → playlistItems (1 unit per page, 50 per page)
  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;
  const videoIds = [];
  let pageToken;
  let pages = 0;
  do {
    const pi = await apiGet('playlistItems', { part: 'contentDetails', playlistId: uploadsId, maxResults: '50', pageToken: pageToken || '' }, key);
    for (const it of pi.items) videoIds.push(it.contentDetails.videoId);
    pageToken = pi.nextPageToken;
    pages++;
  } while (pageToken && pages < 12); // bound: 600 videos max per run
  if (process.env.YT_TRACK_ALL !== '1') videoIds.length = Math.min(videoIds.length, 160); // bounded default

  // videos.list in batches of 50 (1 unit each)
  let updatedVideos = 0;
  const known = new Set(Object.keys(yt.videos || {}));
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const vs = await apiGet('videos', { part: 'snippet,statistics,contentDetails', id: batch.join(',') }, key);
    for (const v of vs.items || []) {
      const rec = {
        title: v.snippet.title, tag: classifyTag(v),
        channelId: v.snippet.channelId, channel: v.snippet.channelTitle,
        publishedAt: v.snippet.publishedAt,
        thumb: (v.snippet.thumbnails && (v.snippet.thumbnails.medium || v.snippet.thumbnails.default) || {}).url || '',
        workIds: [],
      };
      const prev = (yt.videos[v.id] || {});
      // catalogue refresh: only set fields we did not have (catalog edits stay manual)
      const entry = yt.videos[v.id] = yt.videos[v.id] || {};
      for (const k of ['title', 'tag', 'channelId', 'channel', 'publishedAt', 'thumb']) {
        if (!entry[k] && rec[k]) entry[k] = rec[k];
      }
      entry.views = entry.views || {};
      const dayRec = {
        v: parseInt(v.statistics.viewCount || '0', 10), estimated: false,
        source: 'https://www.googleapis.com/youtube/v3/videos', method: 'official-youtube-data-api',
      };
      const existing = entry.views[TODAY_KST];
      if (existing && existing.v !== dayRec.v) existing.alt = { v: existing.v, source: existing.source, method: existing.method };
      entry.views[TODAY_KST] = dayRec;
      if (v.statistics.likeCount) {
        entry.likes = entry.likes || {};
        entry.likes[TODAY_KST] = {
          v: parseInt(v.statistics.likeCount, 10), estimated: false,
          source: 'https://www.googleapis.com/youtube/v3/videos', method: 'official-youtube-data-api',
        };
      }
      if (!known.has(v.id)) updatedVideos++;
    }
  }
  yt.meta.lastCollection = NOW_ISO;
  yt.meta.lastCollectionMode = 'official-youtube-data-api';
  writeJson(ytPath, yt);
  return { channelViews: yt.channel.views[TODAY_KST].v, videos: videoIds.length, newVideos: updatedVideos, apiPages: pages };
}

function classifyTag(v) {
  const t = `${v.snippet.title} ${v.snippet.description || ''}`.toLowerCase();
  if (/\bmv\b|music video/.test(t)) return 'music_video';
  if (/performance video|performance video|dance practice|practice/.test(t)) return 'dance_performance';
  if (/dance cover|dance challenge/.test(t)) return 'dance_cover';
  if (/cover|콘서트|begin again|the first take|it's live|band live/.test(t)) return 'cover';
  if (/inkigayo|music bank|music core|show champion|m countdown|mnet|mbc|sbs|kpop|가요|인기가요/.test(t)) return 'music_show';
  return 'performance';
}

/* ---------------- main ---------------- */

(async () => {
  const summary = { day: TODAY_KST, at: NOW_ISO };
  const results = {};
  let failed = 0;
  try { results.kworb = await collectKworb(); }
  catch (e) { results.kworb = { error: e.message }; failed++; }
  try { results.youtube = await collectYouTube(); }
  catch (e) { results.youtube = { error: e.message }; failed++; }

  summary.results = results;
  summary.failed = failed;
  const statusPath = path.join(DATA, 'feed-status.json');
  try {
    const status = readJson(statusPath);
    for (const c of (status.meta.collectors || [])) {
      if (c.id === 'kworb-spotify') {
        c.lastRun = NOW_ISO;
        c.status = results.kworb.error ? 'error' : 'ok';
        if (results.kworb.error) c.note = results.kworb.error;
      }
      if (c.id === 'youtube-data-api') {
        c.lastRun = NOW_ISO;
        c.status = results.youtube.error ? 'error' : (results.youtube.skipped ? 'awaiting-key' : 'ok');
        if (results.youtube.error) c.note = results.youtube.error;
        if (results.youtube.skipped) c.note = results.youtube.reason;
      }
    }
    writeJson(statusPath, status);
  } catch {}

  fs.writeFileSync(path.join(ROOT, 'scripts', 'last-collect-summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  if (failed >= 2) process.exit(1); // both providers failed
})();
