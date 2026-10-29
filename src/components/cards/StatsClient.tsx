"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageCircle, Bookmark, Share2, ExternalLink, Youtube } from "lucide-react";
import ScreenHeader from "@/components/app-shell/ScreenHeader";
import BottomNav from "@/components/bottom-nav/BottomNav";
import SourceBadge from "@/components/ui/SourceBadge";
import EmptyState from "@/components/ui/EmptyState";
import GrowthChart from "@/components/charts/GrowthChart";
import { formatNumber, formatCompact } from "@/lib/formatters";

export interface StatSnapshot {
  entityId: string;
  entityTitle: string;
  metric: string;
  value: number;
  observedAt: string;
  sourceUrl: string;
}

export interface StatSong {
  id: string;
  title: string;
  type: string;
  releaseDate: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  coverTheme: string;
  entityId: string;
}

export interface StatMilestone {
  id: string;
  label: string;
  detail: string;
  state: "achieved" | "in-progress" | "not-verified";
  progress: number | null;
  dateText: string | null;
  sourceUrl: string | null;
}

const SECONDARY = [
  { key: "likes", label: "Likes", icon: ThumbsUp },
  { key: "comments", label: "Comments", icon: MessageCircle },
  { key: "saves", label: "Saves", icon: Bookmark },
  { key: "shares", label: "Shares", icon: Share2 },
] as const;

const COVER_THEMES: Record<string, [string, string]> = {
  deserve: ["#3E3A45", "#8B7BD8"],
  wego: ["#FF4F9A", "#FF9CC2"],
  sugar: ["#FFC66E", "#FF8FB0"],
};

export default function StatsClient({
  songs,
  snapshotsBySong,
  milestones,
}: {
  songs: StatSong[];
  snapshotsBySong: Record<string, StatSnapshot[]>;
  milestones: StatMilestone[];
}) {
  const [tab, setTab] = useState<"youtube" | "spotify">("youtube");
  const [songIdx, setSongIdx] = useState(0);
  const [range, setRange] = useState<"7D" | "30D" | "90D" | "All">("30D");

  const song = songs[songIdx] ?? songs[0];
  const series = useMemo(
    () => (snapshotsBySong[song?.entityId] ?? []).slice().sort((a, b) => a.observedAt < b.observedAt ? -1 : 1),
    [song, snapshotsBySong],
  );
  const latest = series[series.length - 1] ?? null;
  const first = series[0] ?? null;
  const delta =
    series.length >= 2 && first && latest && first.value > 0
      ? ((latest.value - first.value) / first.value) * 100
      : null;

  const [from, to] = COVER_THEMES[song?.coverTheme] ?? ["#F6CDE0", "#DCD3FA"];

  return (
    <main className="app-canvas" style={{ paddingBottom: 96 }}>
      <ScreenHeader title="Stats" />

      <div className="screen-gutter pt-1 space-y-4">
        {/* segmented tabs */}
        <div
          role="tablist"
          aria-label="Stats source"
          className="grid grid-cols-2 gap-1 p-1 rounded-full"
          style={{ background: "#F3E3EC" }}
        >
          {(["youtube", "spotify"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className="h-11 rounded-full text-[14px] font-extrabold capitalize transition-all"
              style={{
                background: tab === t ? "#FF4F9A" : "transparent",
                color: tab === t ? "#fff" : "#6E5A70",
                boxShadow: tab === t ? "0 4px 14px rgba(255,79,154,0.35)" : "none",
              }}
            >
              {t === "youtube" ? "YouTube" : "Spotify"}
            </button>
          ))}
        </div>

        {tab === "youtube" ? (
          <>
            {/* feature track picker */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Featured song">
              {songs.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === songIdx}
                  type="button"
                  onClick={() => setSongIdx(i)}
                  className={`chip ${i === songIdx ? "chip-active" : "chip-idle"} !h-9 !px-4 !text-[12.5px]`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* feature card */}
            <section className="card-surface p-4" style={{ borderRadius: 20 }} aria-label="Featured video">
              <div className="flex items-center gap-3.5">
                <span
                  className="shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ width: 76, height: 76, borderRadius: 16, background: `linear-gradient(140deg, ${from}, ${to})` }}
                >
                  <span className="font-display font-extrabold text-white leading-none text-center px-1.5" style={{ fontSize: 12, textShadow: "0 1px 3px rgba(32,35,51,0.45)", transform: "rotate(-6deg)" }}>
                    {song.title}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-extrabold text-[19px] text-ink leading-tight">{song.title}</p>
                  <p className="meta-text font-bold text-[13px] mt-0.5">BABYMONSTER</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-full" style={{ background: "rgba(56,41,58,0.06)", color: "#6E5A70" }}>
                      {song.type}
                    </span>
                    {song.youtubeUrl && (
                      <a
                        href={song.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full text-white"
                        style={{ background: "#E0284B" }}
                      >
                        <Youtube size={11} aria-hidden="true" /> Official
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* primary metric */}
              <div className="mt-4">
                <p className="font-display font-extrabold tnum text-ink leading-none" style={{ fontSize: 30 }}>
                  {latest ? formatNumber(latest.value) : "—"}
                </p>
                <p className="meta-text mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span>{latest ? "Total views" : "Total views — not observed yet"}</span>
                  {latest && (
                    <span>
                      ({new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(latest.observedAt))})
                    </span>
                  )}
                  {delta !== null && (
                    <span className="font-extrabold" style={{ color: "#1FA97A" }}>
                      ↑ {delta.toFixed(1)}% since first snapshot
                    </span>
                  )}
                </p>
                {latest && <div className="mt-2"><SourceBadge sourceUrl={latest.sourceUrl} sourceLabel="View on YouTube" observedAt={latest.observedAt} /></div>}
              </div>

              {/* secondary stat cards — honest states */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {SECONDARY.map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl"
                    style={{ background: "#FFF9FC", border: "1px solid rgba(56,41,58,0.08)" }}
                  >
                    <Icon size={17} color="#FF4F9A" aria-hidden="true" />
                    <span className="tnum text-[13px] font-extrabold text-ink mt-1">—</span>
                    <span className="text-[9.5px] font-bold text-ink-soft text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>
              <p className="meta-text mt-2 !text-[10.5px]">
                Likes / comments / saves / shares are not publicly available through permitted sources in this version.
              </p>
            </section>

            {/* growth chart */}
            <section className="card-surface p-4" style={{ borderRadius: 20 }} aria-label="View growth">
              <div className="flex items-center justify-between mb-3">
                <h2 className="section-title !text-[15px]">View Growth</h2>
                <div className="flex gap-1" role="tablist" aria-label="Chart range">
                  {(["7D", "30D", "90D", "All"] as const).map((r) => (
                    <button
                      key={r}
                      role="tab"
                      aria-selected={range === r}
                      type="button"
                      onClick={() => setRange(r)}
                      className="px-2.5 h-7 rounded-full text-[11px] font-extrabold transition-colors"
                      style={{
                        background: range === r ? "#FF4F9A" : "#FFF9FC",
                        color: range === r ? "#fff" : "#6E5A70",
                        border: "1px solid rgba(56,41,58,0.08)",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {series.length >= 2 ? (
                <GrowthChart
                  points={series.map((s) => ({ t: s.observedAt, v: s.value }))}
                  range={range}
                />
              ) : (
                <EmptyState
                  compact
                  title="History starts when we begin recording snapshots."
                  hint={
                    series.length === 1
                      ? "One observation exists (seen above). The chart renders after the next dated snapshot is recorded."
                      : "No observations recorded for this video yet."
                  }
                />
              )}
            </section>

            {/* milestones */}
            <section id="milestones" aria-label="Milestones" className="scroll-mt-20">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="section-title">Milestones</h2>
                <Link href="/discover" className="text-[13px] font-bold" style={{ color: "#FF4F9A" }}>
                  See all
                </Link>
              </div>
              <ul className="space-y-2.5">
                {milestones.map((m) => (
                  <li key={m.id} className="card-surface p-3.5 flex items-center gap-3" style={{ borderRadius: 18 }}>
                    <span
                      className="shrink-0 inline-flex items-center justify-center rounded-xl"
                      style={{ width: 42, height: 42, background: "rgba(255,79,154,0.10)" }}
                    >
                      <Youtube size={19} color="#FF4F9A" aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-extrabold text-ink leading-tight">{m.label}</p>
                      <p className="meta-text mt-0.5">{m.detail}</p>
                      {m.progress !== null && (
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "#F6CDE0" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(100, m.progress * 100)}%`, background: "#FF4F9A" }}
                          />
                        </div>
                      )}
                      {m.sourceUrl && (
                        <a
                          href={m.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="meta-text mt-1 inline-flex items-center gap-0.5 underline decoration-dotted"
                        >
                          Source <ExternalLink size={10} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                      style={{
                        background:
                          m.state === "achieved" ? "rgba(87,190,149,0.14)" : m.state === "in-progress" ? "rgba(255,231,174,0.4)" : "rgba(56,41,58,0.06)",
                        color: m.state === "achieved" ? "#1F8A62" : m.state === "in-progress" ? "#B98A1F" : "#6E5A70",
                      }}
                    >
                      {m.state === "achieved" ? "Achieved" : m.state === "in-progress" ? "In progress" : "Not verified"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          /* SPOTIFY TAB — honest state */
          <section className="space-y-4" aria-label="Spotify catalogue">
            <div
              className="rounded-2xl p-3.5 text-[12.5px] font-bold leading-relaxed"
              style={{ background: "rgba(203,239,223,0.35)", color: "#1F6B4C", border: "1px solid rgba(87,190,149,0.25)" }}
            >
              Stream counts are not available in this version. Explore official releases below — links open Spotify.
            </div>
            {songs.map((s) => {
              const [cfrom, cto] = COVER_THEMES[s.coverTheme] ?? ["#F6CDE0", "#DCD3FA"];
              return (
                <div key={s.id} className="card-surface p-3.5 flex items-center gap-3" style={{ borderRadius: 18 }}>
                  <span
                    className="shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(140deg, ${cfrom}, ${cto})` }}
                  >
                    <span className="font-display font-extrabold text-white text-center px-1 leading-none" style={{ fontSize: 9, textShadow: "0 1px 3px rgba(32,35,51,0.4)", transform: "rotate(-6deg)" }}>
                      {s.title}
                    </span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-extrabold text-ink truncate">{s.title}</p>
                    <p className="meta-text">
                      {s.type}
                      {s.releaseDate ? ` · ${s.releaseDate}` : ""}
                    </p>
                  </div>
                  {s.spotifyUrl && (
                    <a
                      href={s.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-[11.5px] font-extrabold px-3 py-1.5 rounded-full text-white shrink-0"
                      style={{ background: "#1DB954" }}
                    >
                      Open
                    </a>
                  )}
                </div>
              );
            })}
            <p className="meta-text !text-[10.5px] text-center">
              No private Spotify endpoints are used; nothing is scraped from the web player.
            </p>
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
