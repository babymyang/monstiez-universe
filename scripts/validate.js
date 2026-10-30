#!/usr/bin/env node
/* Validates data/*.json shape and honesty invariants. Exits non-zero on violation. */
'use strict';
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'data');
let errors = 0, warnings = 0;
const err = (m) => { console.error('ERROR:', m); errors++; };
const warn = (m) => { console.warn('WARN:', m); warnings++; };

function read(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

const catalog = read(path.join(DATA, 'catalog.json'));
const yt = read(path.join(DATA, 'series', 'youtube.json'));
const sp = read(path.join(DATA, 'series', 'spotify.json'));

// catalog
if (!catalog.channelId || !/^UC[\w-]{22}$/.test(catalog.channelId)) err('catalog.channelId invalid');
if (!catalog.artistId || !/^[A-Za-z0-9]{22}$/.test(catalog.artistId)) err('catalog.artistId invalid');
for (const v of catalog.videos) {
  if (!/^[\w-]{11}$/.test(v.id)) err(`video id invalid: ${v.id}`);
  if (!v.title) err(`video ${v.id} missing title`);
  if (!v.publishedAt) warn(`video ${v.id} missing publishedAt`);
}
for (const s of catalog.songs) {
  if (!s.trackId || !/^[A-Za-z0-9]{22}$/.test(s.trackId)) err(`song ${s.key} trackId invalid`);
  if (!s.releaseDate) warn(`song ${s.key} missing releaseDate`);
}
if (!catalog.videos.length) err('catalog has no videos');
if (!catalog.songs.length) err('catalog has no songs');

// series honesty rules
function checkSeries(obj, label) {
  if (!obj.meta || !obj.meta.version) err(`${label}: missing meta.version`);
}
function checkDays(days, label) {
  for (const [day, rec] of Object.entries(days)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) err(`${label}: bad day key ${day}`);
    if (typeof rec.v !== 'number' || !Number.isFinite(rec.v) || rec.v < 0) err(`${label}/${day}: value not a finite number >= 0`);
    if (!rec.source) err(`${label}/${day}: missing source (provenance required)`);
    if (!rec.method) err(`${label}/${day}: missing method`);
  }
}
checkSeries(yt, 'youtube');
checkSeries(sp, 'spotify');
for (const [vid, entry] of Object.entries(yt.videos || {})) {
  for (const metric of ['views', 'likes']) {
    if (entry[metric]) checkDays(entry[metric], `youtube/${vid}/${metric}`);
  }
}
for (const [key, days] of Object.entries(sp.tracks || {})) checkDays(days, `spotify/${key}`);
if (yt.channel) {
  checkDays(yt.channel.views || {}, 'youtube/channel/views');
  checkDays(yt.channel.subscribers || {}, 'youtube/channel/subscribers');
}
if (sp.artist) {
  checkDays(sp.artist.followers || {}, 'spotify/artist/followers');
  checkDays(sp.artist.monthlyListeners || {}, 'spotify/artist/monthlyListeners');
}

// monotonicity sanity (allow small regressions; flag big drops as likely schema drift)
function monotonic(days, label) {
  const entries = Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
  for (let i = 1; i < entries.length; i++) {
    const [d0, r0] = entries[i - 1], [d1, r1] = entries[i];
    if (r1.v < r0.v * 0.98) warn(`${label}: value drops from ${r0.v} (${d0}) to ${r1.v} (${d1}) — verify provider scope`);
  }
}
for (const [key, days] of Object.entries(sp.tracks || {})) monotonic(days, `spotify/${key}`);

console.log(`\n${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
