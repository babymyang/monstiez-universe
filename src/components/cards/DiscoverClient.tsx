"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ExternalLink, Bookmark, CheckCircle2 } from "lucide-react";
import ScreenHeader from "@/components/app-shell/ScreenHeader";
import BottomNav from "@/components/bottom-nav/BottomNav";
import Thumb from "@/components/ui/Thumb";
import EmptyState from "@/components/ui/EmptyState";
import ChipRow from "@/components/ui/ChipRow";
import SourceBadge from "@/components/ui/SourceBadge";
import { useLocalPreferences } from "@/hooks/use-preferences";

export interface DiscoverItem {
  id: string;
  videoId: string;
  title: string;
  type: string;
  duration: string | null;
  url: string;
  releaseDate: string | null;
  ageText: string | null;
  viewsText: string | null;
  status: string;
}

const TYPE_CHIPS = [
  { value: "all", label: "All" },
  { value: "MV", label: "MV" },
  { value: "Performance", label: "Performance" },
  { value: "Behind", label: "Behind" },
  { value: "Tour", label: "Tour" },
];

export default function DiscoverClient({ items }: { items: DiscoverItem[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [prefs, updatePrefs] = useLocalPreferences();
  const bookmarks = prefs.bookmarks;
  const watched = prefs.watched;

  const toggle = (key: "bookmarks" | "watched", id: string) => {
    updatePrefs((p) => ({
      ...p,
      [key]: p[key].includes(id) ? p[key].filter((x) => x !== id) : [...p[key], id],
    }));
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (type !== "all" && it.type !== type) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        it.type.toLowerCase().includes(q) ||
        "babymonster baemon".includes(q)
      );
    });
  }, [items, query, type]);

  return (
    <main className="app-canvas" style={{ paddingBottom: 96 }}>
      <ScreenHeader title="Discover" />

      <div className="screen-gutter pt-2 space-y-4">
        {/* search — operates on the local catalogue only, no network call */}
        <div
          className="flex items-center gap-2.5 h-12 px-4 rounded-full"
          style={{ background: "#fff", border: "1px solid rgba(56,41,58,0.08)", boxShadow: "0 2px 8px rgba(56,41,58,0.05)" }}
        >
          <Search size={19} color="#6E5A70" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the curated catalogue…"
            aria-label="Search curated content"
            className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-ink placeholder:text-ink-soft/60"
          />
        </div>

        <ChipRow options={TYPE_CHIPS} value={type} onChange={setType} ariaLabel="Content type" />

        <p className="meta-text !text-[11px]">
          {results.length} of {items.length} curated items · search runs locally, instantly
        </p>

        {results.length > 0 ? (
          <ul className="space-y-2.5">
            {results.map((c) => (
              <li key={c.id} className="card-surface p-2.5 flex gap-3 items-center" style={{ borderRadius: 18 }}>
                <Thumb videoId={c.videoId} alt={c.title} duration={c.duration} size="sm" label={c.type.toUpperCase()} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-extrabold text-ink leading-tight line-clamp-2">{c.title.replace("BABYMONSTER - ", "")}</p>
                  <p className="meta-text mt-0.5 truncate">
                    {c.type}
                    {c.ageText ? ` · ${c.ageText}` : ""}
                    {c.viewsText ? ` · ${c.viewsText}` : ""}
                  </p>
                  <div className="mt-1">
                    <SourceBadge sourceUrl={c.url} sourceLabel="Official link" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggle("bookmarks", c.id)}
                    aria-pressed={bookmarks.includes(c.id)}
                    aria-label={bookmarks.includes(c.id) ? "Remove bookmark" : "Bookmark"}
                    className="icon-btn !w-9 !h-9"
                  >
                    <Bookmark size={16} color={bookmarks.includes(c.id) ? "#FF4F9A" : "#6E5A70"} fill={bookmarks.includes(c.id) ? "#FF4F9A" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle("watched", c.id)}
                    aria-pressed={watched.includes(c.id)}
                    aria-label={watched.includes(c.id) ? "Mark as unwatched" : "Mark as watched"}
                    className="icon-btn !w-9 !h-9"
                  >
                    <CheckCircle2 size={16} color={watched.includes(c.id) ? "#57BE95" : "#6E5A70"} fill={watched.includes(c.id) ? "#57BE95" : "none"} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nothing matches your search"
            hint="Try a different keyword — the catalogue only contains verified official items."
          />
        )}

        <p className="meta-text !text-[10.5px] text-center pb-2">
          Recent uploads refresh from the official channel RSS feed at build time — see README.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
