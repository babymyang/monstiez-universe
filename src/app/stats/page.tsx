import type { Metadata } from "next";
import StatsClient, { StatMilestone, StatSnapshot, StatSong } from "@/components/cards/StatsClient";
import { getSnapshots, songs } from "@/lib/data";

export const metadata: Metadata = { title: "Stats" };

export default function StatsPage() {
  const statSongs: StatSong[] = songs
    .filter((s) => s.status === "verified")
    .map((s) => ({
      id: s.id,
      title: s.title,
      type: s.type,
      releaseDate: s.releaseDate,
      youtubeUrl: s.youtubeUrl,
      spotifyUrl: s.spotifyUrl,
      coverTheme: s.coverTheme,
      entityId: s.youtubeUrl?.match(/v=([a-zA-Z0-9_-]{11})/)?.[1] ?? s.id,
    }));

  const snapshots = getSnapshots();
  const snapshotsBySong: Record<string, StatSnapshot[]> = {};
  for (const snap of snapshots) {
    (snapshotsBySong[snap.entityId] ??= []).push(snap);
  }

  const wego = snapshots.filter((s) => s.entityId === "wlHwjkYpSr0" && s.metric === "viewCount");
  const deserve = snapshots.filter((s) => s.entityId === "oC6brLXQe4I" && s.metric === "viewCount");

  const milestones: StatMilestone[] = [
    {
      id: "wego-100m",
      label: "WE GO UP M/V — 100M views on YouTube",
      detail: "Achieved Oct 23, 2025 · fastest 2025 K-pop MV (13 days after release)",
      state: "achieved",
      progress: null,
      dateText: "2025-10-23",
      sourceUrl: "https://www.facebook.com/BABYMONSTER.ygofficial/posts/1119528291061380",
    },
    {
      id: "deserve-100m",
      label: "DESERVE M/V — 100M views on YouTube",
      detail:
        deserve.length > 0
          ? `Latest observation ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(deserve[0].observedAt))}: ${deserve[0].value.toLocaleString("en-US")} views`
          : "No observation recorded yet",
      state: "in-progress",
      progress: deserve.length > 0 ? deserve[0].value / 100_000_000 : null,
      dateText: null,
      sourceUrl: "https://www.youtube.com/watch?v=oC6brLXQe4I",
    },
    {
      id: "full-album-2027",
      label: "First full-length album",
      detail: "Announced for early 2027 — exact date not yet confirmed",
      state: "not-verified",
      progress: null,
      dateText: null,
      sourceUrl: "https://www.mk.co.kr/en/musics/12168889",
    },
  ];

  return <StatsClient songs={statSongs} snapshotsBySong={snapshotsBySong} milestones={milestones} />;
}
