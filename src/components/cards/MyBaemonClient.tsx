"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, CheckCircle2, RotateCcw, WifiOff, Bell } from "lucide-react";
import ScreenHeader from "@/components/app-shell/ScreenHeader";
import BottomNav from "@/components/bottom-nav/BottomNav";
import MemberAvatar from "@/components/mascot/MemberAvatar";
import { memberVisuals, memberOrder } from "@/lib/design-tokens";
import {
  useLocalPreferences,
  useOnline,
} from "@/hooks/use-preferences";
import {
  resetPreferences,
  type Preferences,
} from "@/lib/local-storage";

export default function MyBaemonClient({ contentTitles }: { contentTitles: Record<string, string> }) {
  const [prefs, updatePrefs] = useLocalPreferences();
  const online = useOnline();
  const [resetDone, setResetDone] = useState(false);

  const mutate = (fn: (p: Preferences) => Preferences) => {
    updatePrefs(fn);
  };

  return (
    <main className="app-canvas" style={{ paddingBottom: 96 }}>
      <ScreenHeader title="My Baemon" />

      <div className="screen-gutter pt-2 space-y-5">
        {/* connection state */}
        <div
          className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[12.5px] font-bold"
          style={{
            background: online ? "rgba(203,239,223,0.35)" : "rgba(255,231,174,0.35)",
            color: online ? "#1F6B4C" : "#8A6A10",
            border: `1px solid ${online ? "rgba(87,190,149,0.25)" : "rgba(185,138,31,0.25)"}`,
          }}
        >
          {online ? <CheckCircle2 size={16} aria-hidden="true" /> : <WifiOff size={16} aria-hidden="true" />}
          {online
            ? "Online — data reflects the last curated/snapshotted values."
            : "Offline — cached shell active; content links need a connection."}
        </div>

        {/* bias selector */}
        <section aria-label="Bias">
          <h2 className="section-title mb-1 flex items-center gap-1.5">
            <Heart size={16} color="#FF4F9A" fill="#FF4F9A" aria-hidden="true" /> My bias
          </h2>
          <p className="meta-text mb-3">Pick one member — Home “For You” and member shortcuts follow your pick.</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {memberOrder.map((slug) => {
              const mv = memberVisuals[slug];
              const active = prefs?.bias === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => mutate((p) => ({ ...p, bias: active ? null : slug }))}
                  className="flex flex-col items-center shrink-0 rounded-2xl px-2 py-2.5"
                  style={{
                    width: 62,
                    background: active ? mv.accentTint : "#fff",
                    border: `1.5px solid ${active ? mv.accent : "rgba(56,41,58,0.08)"}`,
                  }}
                >
                  <MemberAvatar slug={slug} size={38} />
                  <span className="text-[9px] font-extrabold mt-1" style={{ color: active ? "#FF4F9A" : "#6E5A70" }}>
                    {mv.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* bookmarks */}
        <section aria-label="Bookmark">
          <h2 className="section-title mb-2 flex items-center gap-1.5">
            <Bookmark size={16} color="#FF4F9A" aria-hidden="true" /> Bookmark ({prefs?.bookmarks.length ?? 0})
          </h2>
          {(prefs?.bookmarks.length ?? 0) > 0 ? (
            <ul className="card-surface divide-y divide-hairline px-4" style={{ borderRadius: 18 }}>
              {prefs!.bookmarks.map((id) => (
                <li key={id} className="py-3 flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-bold text-ink truncate">{contentTitles[id] ?? id}</span>
                  <button
                    type="button"
                    onClick={() => mutate((p) => ({ ...p, bookmarks: p.bookmarks.filter((b) => b !== id) }))}
                    className="text-[11px] font-bold underline decoration-dotted shrink-0"
                    style={{ color: "#6E5A70" }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="meta-text">No bookmarks yet — tap the bookmark icon on any content row.</p>
          )}
        </section>

        {/* watched */}
        <section aria-label="Watched">
          <h2 className="section-title mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} color="#57BE95" aria-hidden="true" /> Watched ({prefs?.watched.length ?? 0})
          </h2>
          <p className="meta-text">
            {prefs && prefs.watched.length > 0
              ? `${prefs.watched.length} item${prefs.watched.length === 1 ? "" : "s"} marked watched.`
              : "Mark items watched in Discover — status survives app restarts."}
          </p>
        </section>

        {/* reminders */}
        <section aria-label="Reminders">
          <h2 className="section-title mb-2 flex items-center gap-1.5">
            <Bell size={16} color="#9B8EC4" aria-hidden="true" /> Reminders
          </h2>
          <div className="card-surface p-4" style={{ borderRadius: 18 }}>
            <p className="meta-text">
              Reminders are a local in-app list in this version (no push notifications are sent or claimed).
            </p>
            <button
              type="button"
              onClick={() =>
                mutate((p) => ({
                  ...p,
                  reminders:
                    p.reminders.includes("tour-bangkok-2026")
                      ? []
                      : ["tour-bangkok-2026"],
                }))
              }
              className="mt-3 h-10 px-4 rounded-full text-[12.5px] font-extrabold"
              style={{
                background: prefs?.reminders.length ? "rgba(255,79,154,0.12)" : "#202333",
                color: prefs?.reminders.length ? "#FF4F9A" : "#fff",
              }}
            >
              {prefs?.reminders.length ? "Reminder set: Bangkok tour stop (Nov 7)" : "Remind me: next verified tour stop"}
            </button>
          </div>
        </section>

        {/* reset */}
        <section aria-label="Data" className="pb-2">
          <button
            type="button"
            onClick={() => {
              resetPreferences();
              setResetDone(true);
              window.dispatchEvent(new Event("monstiez:prefs-changed"));
            }}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold underline decoration-dotted"
            style={{ color: "#6E5A70" }}
          >
            <RotateCcw size={13} aria-hidden="true" /> Reset all local preferences
          </button>
          {resetDone && <p className="meta-text mt-1">Preferences cleared.</p>}
          <p className="meta-text mt-2">
            Everything on this screen lives in your browser&apos;s localStorage only — no account, no server, no tracking.
          </p>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
