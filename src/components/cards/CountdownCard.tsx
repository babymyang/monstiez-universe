"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Mascot from "@/components/mascot/Mascot";
import { useMounted } from "@/hooks/use-preferences";
import { daysUntil, formatDday } from "@/lib/formatters";

export interface CountdownData {
  chip: string;
  title: string;
  subtitle: string;
  dateIso: string | null;
  venueNote: string | null;
  sourceUrl: string;
  href: string;
}

/**
 * Feature card with a countdown — renders a D-day countdown ONLY when the
 * date is verified from an official source (passed in by the server page).
 * Otherwise keeps the same composition with a truthful "no date" state.
 * Uses the stretched-link pattern so the source anchor is never nested
 * inside another anchor (valid HTML, no hydration errors).
 */
export default function CountdownCard({ data }: { data: CountdownData }) {
  const mounted = useMounted();
  const dday =
    mounted && data.dateIso
      ? (() => {
          const d = daysUntil(data.dateIso);
          return d !== null ? formatDday(d) : null;
        })()
      : null;

  return (
    <div
      className="card-surface relative overflow-hidden"
      style={{
        background: "linear-gradient(120deg, #FBDCEB 0%, #F6CDE0 55%, #F3DBF2 100%)",
        borderRadius: 24,
        padding: 20,
      }}
    >
      {/* stretched link — whole card navigates to the schedule */}
      <Link href={data.href} className="absolute inset-0 z-0" aria-label={`${data.chip}: open schedule`} />
      <div className="relative z-10 pointer-events-none">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
          style={{ background: "#FF4F9A", letterSpacing: "0.08em" }}
        >
          {data.chip}
        </span>

        <div className="flex items-start justify-between mt-3">
          <div>
            <p className="font-display font-extrabold text-ink tnum leading-none" style={{ fontSize: 40 }}>
              {dday ?? data.title}
            </p>
            <p className="mt-2 text-[13px] font-extrabold text-ink" style={{ letterSpacing: "0.04em" }}>
              {data.subtitle}
            </p>
            {data.venueNote && <p className="meta-text mt-0.5">{data.venueNote}</p>}
          </div>
          <div className="relative -mb-2 -mt-1 shrink-0">
            <Mascot size={92} />
          </div>
        </div>

        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 inline-flex items-center justify-center rounded-full bg-white"
          style={{ width: 34, height: 34, boxShadow: "0 4px 12px rgba(56,41,58,0.14)" }}
        >
          <ChevronRight size={19} className="text-ink" />
        </span>
      </div>
      {/* explicit source link above the stretched link */}
      <a
        href={data.sourceUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="sr-only"
      >
        Verified source (opens in a new tab)
      </a>
    </div>
  );
}
