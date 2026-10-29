"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, ExternalLink, Bookmark } from "lucide-react";
import MemberAvatar from "@/components/mascot/MemberAvatar";
import EmptyState from "@/components/ui/EmptyState";
import Thumb from "@/components/ui/Thumb";
import BottomNav from "@/components/bottom-nav/BottomNav";
import { memberVisuals, memberOrder, type MemberSlug } from "@/lib/design-tokens";
import { updatePreferences, readPreferences } from "@/lib/local-storage";
import { formatBirthDate, formatAge, zodiacFrom } from "@/lib/formatters";

export interface MemberPageData {
  slug: MemberSlug;
  name: string;
  order: number;
  birthDate: string;
  birthDateSource: string;
  verifiedAt: string;
  content: {
    id: string;
    videoId: string;
    title: string;
    type: string;
    duration: string | null;
    url: string;
    releaseDate: string | null;
    viewsText: string | null;
  }[];
  moments: { id: string; label: string; detail: string; dateText: string; url: string }[];
}

const PROFILE_TABS = ["Profile", "Content", "Moments", "Quotes"] as const;
const CONTENT_FILTERS = [
  { value: "all", label: "All" },
  { value: "MV", label: "MV" },
  { value: "Performance", label: "Performance" },
  { value: "Variety", label: "Variety" },
  { value: "Shorts", label: "Shorts" },
];

function typeToFilter(type: string): string {
  if (type === "MV") return "MV";
  if (type === "Performance" || type === "Tour") return "Performance";
  if (type === "Behind") return "Variety";
  return "Variety";
}

export default function MemberDetailClient({ data }: { data: MemberPageData }) {
  const router = useRouter();
  const v = memberVisuals[data.slug];
  const [tab, setTab] = useState<(typeof PROFILE_TABS)[number]>("Profile");
  const [filter, setFilter] = useState("all");
  const [isBias, setIsBias] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useMemo(() => {
    // initial local state on first render (client-only component usage)
    try {
      const prefs = readPreferences();
      setIsBias(prefs.bias === data.slug);
      setBookmarks(prefs.bookmarks);
    } catch {
      /* noop */
    }
  }, [data.slug]);

  const toggleBias = () => {
    const next = !isBias;
    setIsBias(next);
    try {
      updatePreferences((p) => ({ ...p, bias: next ? data.slug : null }));
    } catch {
      /* noop */
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      try {
        updatePreferences((p) => ({ ...p, bookmarks: next }));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const filteredContent = data.content.filter(
    (c) => filter === "all" || typeToFilter(c.type) === filter,
  );

  return (
    <main className="app-canvas" style={{ paddingBottom: 96 }}>
      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: "rgba(255,249,252,0.92)", backdropFilter: "blur(10px)" }}>
        <div className="safe-top" />
        <div className="relative h-14 flex items-center justify-center screen-gutter">
          <button
            type="button"
            aria-label="Back to Home"
            onClick={() => router.push("/home")}
            className="icon-btn absolute left-3 top-1/2 -translate-y-1/2"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <h1 className="text-[17px] font-extrabold text-ink">Members</h1>
        </div>
      </header>

      <div className="screen-gutter pt-2 space-y-4">
        {/* member selector */}
        <nav aria-label="Member selector" className="flex gap-1 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
          {memberOrder.map((slug) => {
            const mv = memberVisuals[slug];
            const active = slug === data.slug;
            return (
              <Link
                key={slug}
                href={`/members/${slug}`}
                aria-current={active ? "true" : undefined}
                className="flex flex-col items-center shrink-0 pt-1"
                style={{ width: 52 }}
              >
                <span
                  className="rounded-full transition-transform"
                  style={{
                    padding: 2,
                    border: active ? `2.5px solid ${slug === "ruka" ? "#FF4F9A" : mv.accent}` : "2.5px solid transparent",
                    background: active ? mv.accentTint : "transparent",
                    transform: active ? "scale(1.06)" : "scale(1)",
                  }}
                >
                  <MemberAvatar slug={slug} size={40} />
                </span>
                <span
                  className="text-[9px] font-extrabold mt-0.5"
                  style={{ color: active ? "#FF4F9A" : "#6E5A70", letterSpacing: "0.02em" }}
                >
                  {mv.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* profile card */}
        <section
          className="relative overflow-hidden"
          style={{
            borderRadius: 24,
            background: `linear-gradient(135deg, #FFFFFF 55%, ${v.accentTint})`,
            border: "1px solid rgba(56,41,58,0.08)",
            boxShadow: "0 6px 20px rgba(56,41,58,0.06)",
          }}
          aria-label={`${v.name} profile`}
        >
          <div className="flex items-stretch">
            {/* portrait */}
            <div
              className="shrink-0 flex items-center justify-center relative"
              style={{ width: 158, background: `linear-gradient(160deg, ${v.accentTint}, transparent)` }}
            >
              <div className="scale-[1.7] translate-y-1">
                <MemberAvatar slug={data.slug} size={90} />
              </div>
              <Heart
                className="absolute twinkle"
                style={{ top: 12, left: 14 }}
                size={15}
                color="#FF7FAE"
                fill="#FF7FAE"
                aria-hidden="true"
              />
            </div>

            {/* text */}
            <div className="flex-1 py-4 pr-4 relative">
              <button
                type="button"
                onClick={toggleBias}
                aria-pressed={isBias}
                aria-label={isBias ? `Remove ${v.name} as bias` : `Set ${v.name} as bias`}
                className="icon-btn absolute right-2.5 top-2.5 !w-9 !h-9"
                style={isBias ? { background: "rgba(255,79,154,0.14)" } : undefined}
              >
                <Heart size={17} color={isBias ? "#FF4F9A" : "#6E5A70"} fill={isBias ? "#FF4F9A" : "none"} />
              </button>

              <p className="font-display font-extrabold text-[21px] text-ink leading-none">{v.name}</p>
              <p className="meta-text mt-0.5">BABYMONSTER</p>

              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  `${data.birthDate.slice(0, 4)} LINE`,
                  zodiacFrom(data.birthDate).toUpperCase(),
                  `#${data.order} LINEUP`,
                ].map((pill) => (
                  <span
                    key={pill}
                    className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: v.accentTint, color: "#38293A" }}
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <dl className="mt-2.5 space-y-1 text-[11px]">
                <div className="flex gap-1.5">
                  <dt className="font-bold" style={{ color: "#6E5A70", minWidth: 44 }}>Born</dt>
                  <dd className="font-extrabold text-ink tnum">{formatBirthDate(data.birthDate)}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="font-bold" style={{ color: "#6E5A70", minWidth: 44 }}>Zodiac</dt>
                  <dd className="font-extrabold text-ink">{zodiacFrom(data.birthDate)} <span className="font-semibold" style={{ color: "#9B8AA0" }}>(derived)</span></dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="font-bold" style={{ color: "#6E5A70", minWidth: 44 }}>Source</dt>
                  <dd>
                    <a
                      href={data.birthDateSource}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-bold underline decoration-dotted"
                      style={{ color: "#FF4F9A" }}
                    >
                      YG official profile
                    </a>
                  </dd>
                </div>
              </dl>

              {/* decorative doodle */}
              <svg width="74" height="22" viewBox="0 0 74 22" className="absolute bottom-2 right-3 opacity-70" aria-hidden="true">
                <path d="M4 16 C 14 4, 22 20, 32 10 S 52 2, 58 12" stroke={v.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M62 8 c2 -3 6 -1.5 6 1.5 c0 2.5 -3.5 4.5 -6 6.5 c-2.5 -2 -6 -4 -6 -6.5 c0 -3 4 -4.5 6 -1.5 Z" fill={v.accent} opacity="0.85" />
              </svg>
            </div>
          </div>
        </section>

        {/* profile tabs */}
        <div role="tablist" aria-label="Profile sections" className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {PROFILE_TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className={`chip ${tab === t ? "chip-active" : "chip-idle"} !h-10 !px-5 !text-[13px]`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Profile" && (
          <section className="card-surface p-4 space-y-2.5" style={{ borderRadius: 20 }} aria-label="Verified profile facts">
            <h2 className="section-title !text-[15px]">Verified facts</h2>
            <p className="meta-text">
              Only facts confirmed by official YG sources are shown. Positions, MBTI, and
              other profile details are not published officially, so they are not displayed.
            </p>
            <div className="rounded-xl p-3" style={{ background: "#FFF9FC", border: "1px solid rgba(56,41,58,0.08)" }}>
              <p className="text-[12px] font-extrabold text-ink">Birth date</p>
              <p className="text-[12.5px] font-bold tnum mt-0.5" style={{ color: "#6E5A70" }}>
                {formatBirthDate(data.birthDate)} · verified {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(data.verifiedAt))}
              </p>
            </div>
          </section>
        )}

        {tab === "Content" && (
          <section aria-label={`${v.name} content`}>
            <div role="tablist" aria-label="Content filters" className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
              {CONTENT_FILTERS.map((f) => (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={filter === f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`chip ${filter === f.value ? "chip-active" : "chip-idle"} !h-9 !px-4 !text-[12px]`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredContent.length > 0 ? (
              <ul className="space-y-2.5">
                {filteredContent.map((c) => (
                  <li key={c.id} className="card-surface p-2.5 flex gap-3 items-center" style={{ borderRadius: 18 }}>
                    <Thumb videoId={c.videoId} alt={c.title} duration={c.duration} size="sm" label={c.type.toUpperCase()} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-extrabold text-ink leading-tight truncate">{c.title.replace("BABYMONSTER - ", "")}</p>
                      <p className="meta-text mt-0.5 truncate">
                        {v.name} · {c.type}
                        {c.releaseDate ? ` · ${formatAge(c.releaseDate)}` : ""}
                        {c.viewsText ? ` · ${c.viewsText}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(c.id)}
                        aria-pressed={bookmarks.includes(c.id)}
                        aria-label={bookmarks.includes(c.id) ? "Remove bookmark" : "Bookmark"}
                        className="icon-btn !w-9 !h-9"
                      >
                        <Bookmark size={16} color={bookmarks.includes(c.id) ? "#FF4F9A" : "#6E5A70"} fill={bookmarks.includes(c.id) ? "#FF4F9A" : "none"} />
                      </button>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        aria-label="Watch on YouTube"
                        className="icon-btn !w-9 !h-9"
                      >
                        <ExternalLink size={15} color="#6E5A70" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                title={`No ${CONTENT_FILTERS.find((f) => f.value === filter)?.label ?? ""} content verified yet`}
                hint="Curated official links land here as they are verified — nothing is auto-scraped."
              />
            )}
            <p className="meta-text !text-[10.5px] mt-3 text-center">
              Member-specific broadcast fancams exist on broadcaster channels; per-member links are curated in a future data refresh.
            </p>
          </section>
        )}

        {tab === "Moments" && (
          <section aria-label="Moments">
            {data.moments.length > 0 ? (
              <>
                <p className="meta-text mb-2">Group moments so far — member-specific moments are not sourced yet.</p>
                <ul className="space-y-2.5">
                  {data.moments.map((m) => (
                    <li key={m.id} className="card-surface p-3.5" style={{ borderRadius: 18 }}>
                      <div className="flex items-center gap-2.5">
                        <span className="shrink-0 rounded-xl" style={{ width: 38, height: 38, background: v.accentTint }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-extrabold text-ink">{m.label}</p>
                          <p className="meta-text">{m.detail} · {m.dateText}</p>
                        </div>
                        <a href={m.url} target="_blank" rel="noopener noreferrer nofollow" aria-label="Source" className="icon-btn !w-9 !h-9">
                          <ExternalLink size={15} color="#6E5A70" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <EmptyState compact title="No sourced moments yet" hint="Moments appear once verified from official sources." />
            )}
          </section>
        )}

        {tab === "Quotes" && (
          <section aria-label="Quotes">
            <EmptyState
              title="No verified quotes yet"
              hint="Quotes are added only from official interviews with full attribution — never invented."
            />
          </section>
        )}

        <p className="meta-text !text-[10.5px] text-center pb-2">
          Fan-made · not affiliated with YG Entertainment or BABYMONSTER.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
