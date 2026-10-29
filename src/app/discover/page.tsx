import type { Metadata } from "next";
import DiscoverClient, { DiscoverItem } from "@/components/cards/DiscoverClient";
import { officialVerifiedContent, latestSnapshot, feedStatus } from "@/lib/data";
import { formatAge } from "@/lib/formatters";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  const items: DiscoverItem[] = officialVerifiedContent().map((c) => {
    const snap = latestSnapshot(c.videoId);
    return {
      id: c.id,
      videoId: c.videoId,
      title: c.title,
      type: c.type,
      duration: c.duration,
      url: c.url,
      releaseDate: c.releaseDate,
      ageText: c.releaseDate ? formatAge(c.releaseDate) : null,
      viewsText: snap ? `${(snap.value / 1e6).toFixed(1)}M views (observed)` : null,
      status: c.status,
    };
  });

  return (
    <>
      {feedStatus.lastSuccessfulFetch === null && (
        <div className="sr-only">
          Live feed unavailable in this environment — showing the curated catalogue fallback.
        </div>
      )}
      <DiscoverClient items={items} />
    </>
  );
}
