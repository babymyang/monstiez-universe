"use client";

import { useState } from "react";

/**
 * Thumbnail slot with designed fallback (brief: no broken image icons).
 * Loads the official YouTube thumbnail by URL (never rehosted); if it is
 * unavailable/blocked, renders an original pastel gradient cover.
 */
export default function Thumb({
  videoId,
  alt,
  duration,
  size = "md",
  gradientFrom = "#F6CDE0",
  gradientTo = "#DCD3FA",
  label,
}: {
  videoId?: string;
  alt: string;
  duration?: string | null;
  size?: "sm" | "md" | "lg";
  gradientFrom?: string;
  gradientTo?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);
  const heights = { sm: 64, md: 96, lg: 132 } as const;
  const h = heights[size];
  const showImg = videoId && !failed;

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: size === "lg" ? "100%" : h * (16 / 9) * (size === "sm" ? 1 : 1),
        height: h,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display font-extrabold text-center leading-tight px-2"
            style={{
              fontSize: size === "sm" ? 11 : 15,
              color: "#38293A",
              textShadow: "0 1px 0 rgba(255,255,255,0.6)",
              transform: "rotate(-4deg)",
            }}
          >
            {label ?? alt.slice(0, 24)}
          </span>
        </div>
      )}
      {duration && (
        <span
          className="absolute bottom-1 right-1 tnum text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md"
          style={{ background: "rgba(32,35,51,0.82)" }}
        >
          {duration}
        </span>
      )}
    </div>
  );
}
