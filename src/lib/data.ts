/**
 * Typed access to the curated, provenance-carrying data files.
 * All production-displayed facts come from here — nothing is invented at render time.
 */
import membersJson from "@data/members.json";
import contentJson from "@data/content.json";
import eventsJson from "@data/events.json";
import songsJson from "@data/song-catalog.json";
import snapshotsJson from "@data/metric-snapshots.json";
import feedStatusJson from "@data/feed-status.json";

export interface Member {
  slug: string;
  name: string;
  order: number;
  birthDate: string;
  birthDateSource: string;
  accent: string;
  accentTint: string;
  avatar: string;
  status: "verified" | "needs_review";
  verifiedAt: string;
  notes?: string;
}

export interface ContentItem {
  id: string;
  videoId: string;
  title: string;
  type: string;
  category: string;
  duration: string | null;
  url: string;
  officialSource: string;
  releaseDate: string | null;
  releaseDateSource: string | null;
  memberTags: string[];
  verifiedAt: string;
  status: "verified" | "needs_review";
  notes?: string;
}

export interface EventItem {
  id: string;
  title: string;
  venue: string | null;
  city: string | null;
  country: string | null;
  date: string | null;
  endDate: string | null;
  type: string;
  state: "upcoming" | "completed" | "announced";
  sourceUrl: string;
  verifiedAt: string;
  status: string;
  notes?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  type: string;
  releaseDate: string | null;
  releaseDateSource: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  coverTheme: string;
  featured: boolean;
  verifiedAt: string;
  status: string;
  notes?: string;
}

export interface Snapshot {
  entityId: string;
  entityTitle: string;
  metric: string;
  value: number;
  observedAt: string;
  sourceUrl: string;
  collectionMethod: string;
  status: "verified" | "demo";
  notes?: string;
}

export interface FeedStatus {
  channelId: string;
  channelIdVerifiedFrom: string;
  feedUrl: string;
  lastSuccessfulFetch: string | null;
  lastKnownVideos: { videoId: string; title: string; publishedAt: string }[];
  lastError: { at: string; httpStatus: number; message: string } | null;
  fallbackInUse: string;
}

export const group = membersJson.group;
export const members = membersJson.members as Member[];
export const contentItems = contentJson.items as ContentItem[];
export const events = eventsJson.events as EventItem[];
export const songs = songsJson.songs as Song[];
export const allSnapshots = snapshotsJson as unknown as {
  snapshots: Snapshot[];
  demo: { series: Snapshot[]; enabledOnlyWhen: string };
};

export const feedStatus = feedStatusJson.feedStatus as FeedStatus;

/**
 * Demo metrics NEVER reach production: enabled only when the build is
 * non-production AND NEXT_PUBLIC_DEMO_METRICS === '1'.
 */
export function getSnapshots(): Snapshot[] {
  const allowDemo =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEMO_METRICS === "1";
  const base = allSnapshots.snapshots.filter(
    (s) => s.status !== "demo" && s.value > 0,
  );
  if (allowDemo) return [...base, ...allSnapshots.demo.series];
  return base;
}

/** Next verified upcoming event (chronologically), or null. */
export function nextUpcomingEvent(eventsList: EventItem[] = events): EventItem | null {
  const now = Date.now();
  const upcoming = eventsList
    .filter((e) => e.state === "upcoming" && e.date && e.status === "verified")
    .filter((e) => new Date(`${e.date}T23:59:59+09:00`).getTime() >= now - 86400000)
    .sort((a, b) => (a.date! < b.date! ? -1 : 1));
  return upcoming[0] ?? null;
}

/** Snapshot for an entity+metric — latest observation wins. */
export function latestSnapshot(
  entityId: string,
  metric = "viewCount",
  snapshots = getSnapshots(),
): Snapshot | null {
  const list = snapshots
    .filter((s) => s.entityId === entityId && s.metric === metric && s.status === "verified")
    .sort((a, b) => (a.observedAt < b.observedAt ? 1 : -1));
  return list[0] ?? null;
}

/** Series for the growth chart — must have >=2 dated observations to render. */
export function snapshotSeries(
  entityId: string,
  metric = "viewCount",
  snapshots = getSnapshots(),
): Snapshot[] {
  return snapshots
    .filter((s) => s.entityId === entityId && s.metric === metric)
    .sort((a, b) => (a.observedAt < b.observedAt ? -1 : 1));
}

export function memberBySlug(slug: string): Member | undefined {
  return members.find((m) => m.slug === slug.toLowerCase());
}

export function contentForMember(memberName: string): ContentItem[] {
  return contentItems.filter(
    (c) => c.status === "verified" && c.memberTags.includes(memberName.toLowerCase()),
  );
}

export function officialVerifiedContent(): ContentItem[] {
  return contentItems.filter((c) => c.status === "verified");
}

export function trendingSongs(): Song[] {
  return songs.filter((s) => s.featured && s.status === "verified");
}
