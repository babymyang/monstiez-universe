/**
 * Build/refresh-time YouTube RSS fetcher (brief §5.1).
 *
 * - Uses ONLY the official public RSS feed of the verified channel.
 * - Never extracts view counts or likes (the feed does not provide them).
 * - Writes a JSON snapshot consumed by the app + updates feed-status.json.
 * - On failure: preserves last-known data and records the exact error.
 *   The app falls back to the curated catalogue — nothing fabricated.
 *
 * Usage: bun scripts/refresh-youtube-rss.ts
 * Optional CI scheduling: run on a conservative interval; commit only if changed.
 */
import { readFileSync, writeFileSync } from "node:fs";

const CHANNEL_ID = "UCqwUnggBBct-AY2lAdI88jQ"; // verified from youtube.com/@BABYMONSTER page HTML (2026-10-29)
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const FEED_STATUS = new URL("../data/feed-status.json", import.meta.url);
const FEED_VIDEOS = new URL("../data/youtube-feed.json", import.meta.url);

interface FeedVideo {
  videoId: string;
  title: string;
  url: string;
  publishedAt: string;
  updatedAt: string;
}

function parseFeed(xml: string): { title: string; videos: FeedVideo[] } {
  const title = xml.match(/<title>([^<]+)<\/title>/)?.[1] ?? "BABYMONSTER";
  const videos: FeedVideo[] = [];
  const entries = xml.split("<entry>").slice(1);
  for (const entry of entries) {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const videoTitle = entry.match(/<title>([^<]+)<\/title>/)?.[1];
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    const updated = entry.match(/<updated>([^<]+)<\/updated>/)?.[1];
    const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1];
    if (!videoId || !videoTitle || !published) continue; // skip malformed entries
    videos.push({
      videoId,
      title: decodeXml(videoTitle),
      url: link ?? `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: published,
      updatedAt: updated ?? published,
    });
  }
  return { title: decodeXml(title), videos };
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function main() {
  const status = JSON.parse(readFileSync(FEED_STATUS, "utf-8"));
  console.log(`Fetching official channel RSS: ${FEED_URL}`);
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "monstiez-universe-feed/1.0 (fan-made app; RSS use only)" },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    if (!xml.includes("<entry") || !xml.includes(CHANNEL_ID)) {
      throw new Error("Feed payload malformed (no entries / channel mismatch)");
    }
    const { videos } = parseFeed(xml);
    // The RSS feed provides ONLY: video id, title, link, published/updated, channel.
    // It does NOT provide view counts or likes — none are stored.
    writeFileSync(
      FEED_VIDEOS,
      JSON.stringify(
        { fetchedAt: new Date().toISOString(), channelId: CHANNEL_ID, videos },
        null,
        2,
      ) + "\n",
    );
    status.feedStatus.lastSuccessfulFetch = new Date().toISOString();
    status.feedStatus.lastKnownVideos = videos.slice(0, 15).map((v) => ({
      videoId: v.videoId,
      title: v.title,
      publishedAt: v.publishedAt,
    }));
    status.feedStatus.lastError = null;
    status.feedStatus.fallbackInUse = "recent-feed";
    console.log(`OK: ${videos.length} recent videos saved to data/youtube-feed.json`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Feed fetch failed: ${message}`);
    console.error("Preserving last-known state; app will use the curated catalogue.");
    status.feedStatus.lastError = {
      at: new Date().toISOString(),
      httpStatus: null,
      message,
    };
    status.feedStatus.fallbackInUse = "curated-catalogue";
  }
  writeFileSync(FEED_STATUS, JSON.stringify(status, null, 2) + "\n");
}

main();
