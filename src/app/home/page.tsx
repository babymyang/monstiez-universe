import type { Metadata } from "next";
import HomeClient, { HomeData } from "@/components/cards/HomeClient";
import {
  events,
  nextUpcomingEvent,
  officialVerifiedContent,
  latestSnapshot,
  trendingSongs,
} from "@/lib/data";
import { formatCompact } from "@/lib/formatters";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  const next = nextUpcomingEvent();
  const verified = officialVerifiedContent();

  const latest = verified.slice(0, 2).map((c) => {
    const snap = latestSnapshot(c.videoId);
    return {
      id: c.id,
      videoId: c.videoId,
      title: c.title.replace("BABYMONSTER - ", ""),
      meta: snap
        ? `Official · ${formatCompact(snap.value)} views`
        : "Official · BABYMONSTER",
      duration: c.duration,
      url: c.url,
    };
  });

  const news = verified
    .filter((c) => ["Behind", "Tour"].includes(c.type))
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      videoId: c.videoId,
      title: c.title.replace("BABYMONSTER - ", ""),
      meta: `Official · ${c.type}`,
      duration: c.duration,
      url: c.url,
    }));

  const trending = trendingSongs().slice(0, 2).map((s, i) => {
    const snap =
      s.id === "we-go-up"
        ? latestSnapshot("wlHwjkYpSr0")
        : s.id === "deserve"
          ? latestSnapshot("oC6brLXQe4I")
          : null;
    return {
      rank: i + 1,
      title: s.title,
      artist: s.artist,
      metric: snap ? formatCompact(snap.value) : null,
      metricLabel: snap ? "YouTube views (manually observed)" : undefined,
      url: s.youtubeUrl ?? "#",
      coverTheme: s.coverTheme,
    };
  });

  const data: HomeData = {
    countdown: next
      ? {
          chip: "WORLD TOUR",
          title: "Next moment",
          subtitle: `${next.date} · ${next.city?.toUpperCase()}${next.venue ? " · " + next.venue.toUpperCase() : ""}`,
          dateIso: next.date,
          venueNote: "Local time · verified from YG official tour listing",
          sourceUrl: next.sourceUrl,
          href: "/events",
        }
      : {
          chip: "NEXT MOMENT",
          title: "No upcoming date confirmed",
          subtitle: "Nothing officially announced yet",
          dateIso: null,
          venueNote: null,
          sourceUrl: "https://ygfamily.com/en/artists/babymonster",
          href: "/events",
        },
    latest,
    latestAllHref: "/discover",
    trending,
    news,
    upcoming: events
      .filter((e) => e.state === "upcoming" && e.date)
      .map((e) => ({
        id: e.id,
        title: "World Tour [춤 (CHOOM)]",
        date: e.date!,
        city: e.city,
        venue: e.venue,
        url: e.sourceUrl,
      })),
    forYou: verified.map((c) => ({
      id: c.id,
      videoId: c.videoId,
      title: c.title.replace("BABYMONSTER - ", ""),
      meta: `Official · ${c.type}`,
      duration: c.duration,
      url: c.url,
    })),
  };

  return <HomeClient data={data} />;
}
