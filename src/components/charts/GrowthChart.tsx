"use client";

import { useMemo, useState } from "react";

export interface ChartPoint {
  t: string; // ISO timestamp
  v: number;
}

const RANGES: Record<string, number> = { "7D": 7, "30D": 30, "90D": 90, All: 36500 };

/**
 * Lightweight SVG line/area chart (no chart lib dependency).
 * Renders ONLY when the caller passes >=2 dated points (enforced by the parent).
 */
export default function GrowthChart({
  points,
  range,
}: {
  points: ChartPoint[];
  range: "7D" | "30D" | "90D" | "All";
}) {
  const [hover, setHover] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const days = RANGES[range] ?? 30;
    const cutoff = Date.now() - days * 86400000;
    const inRange = points.filter((p) => new Date(p.t).getTime() >= cutoff);
    return inRange.length >= 2 ? inRange : points;
  }, [points, range]);

  const W = 320;
  const H = 150;
  const PAD_L = 44;
  const PAD_R = 14;
  const PAD_T = 16;
  const PAD_B = 26;

  const { xs, ys, path, area, min, max } = useMemo(() => {
    const vals = filtered.map((p) => p.v);
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const pad = Math.max((rawMax - rawMin) * 0.15, rawMax * 0.005, 1);
    const min = rawMin - pad;
    const max = rawMax + pad;
    const ts = filtered.map((p) => new Date(p.t).getTime());
    const tMin = Math.min(...ts);
    const tMax = Math.max(...ts);
    const x = (i: number) =>
      tMax === tMin
        ? PAD_L + (W - PAD_L - PAD_R) / 2
        : PAD_L + ((ts[i] - tMin) / (tMax - tMin)) * (W - PAD_L - PAD_R);
    const y = (v: number) =>
      PAD_T + (1 - (v - min) / (max - min)) * (H - PAD_T - PAD_B);
    const pts = filtered.map((p, i) => [x(i), y(p.v)] as const);
    const path = pts
      .map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`)
      .join(" ");
    const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${H - PAD_B} L${pts[0][0].toFixed(1)},${H - PAD_B} Z`;
    return { xs: pts.map((p) => p[0]), ys: pts.map((p) => p[1]), path, area, min, max };
  }, [filtered]);

  const fmtCompact = (n: number) =>
    n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : `${n}`;

  const hoverIdx = hover !== null ? hover : filtered.length - 1;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`View growth chart, ${filtered.length} observations`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4F9A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FF4F9A" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* y grid */}
        {[0, 0.5, 1].map((f) => {
          const y = PAD_T + f * (H - PAD_T - PAD_B);
          const v = max - f * (max - min);
          return (
            <g key={f}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="rgba(56,41,58,0.07)" strokeWidth="1" />
              <text x={PAD_L - 6} y={y + 3} textAnchor="end" fontSize="9" fontWeight="700" fill="#6E5A70" style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmtCompact(v)}
              </text>
            </g>
          );
        })}

        <path d={area} fill="url(#areaFill)" />
        <path d={path} fill="none" stroke="#FF4F9A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r={i === hoverIdx ? 4.5 : 3} fill="#fff" stroke="#FF4F9A" strokeWidth="2" />
            <rect
              x={x - 14}
              y={PAD_T}
              width={28}
              height={H - PAD_T - PAD_B}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onTouchStart={() => setHover(i)}
            />
          </g>
        ))}

        {/* x labels: first / middle / last */}
        {[0, Math.floor((filtered.length - 1) / 2), filtered.length - 1].map((i, k, arr) =>
          arr.indexOf(i) !== k || filtered.length < 2 ? null : (
            <text
              key={k}
              x={xs[i]}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === filtered.length - 1 ? "end" : "middle"}
              fontSize="9"
              fontWeight="700"
              fill="#6E5A70"
            >
              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(filtered[i].t))}
            </text>
          ),
        )}
      </svg>

      {filtered.length >= 2 && (
        <div
          className="absolute top-0 right-0 rounded-xl px-2.5 py-1.5 text-right"
          style={{ background: "rgba(32,35,51,0.85)" }}
        >
          <p className="tnum text-[12px] font-extrabold text-white leading-none">
            {fmtCompact(filtered[hoverIdx].v)}
          </p>
          <p className="text-[9px] font-bold text-white/80 mt-0.5">
            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
              new Date(filtered[hoverIdx].t),
            )}
          </p>
        </div>
      )}
    </div>
  );
}
