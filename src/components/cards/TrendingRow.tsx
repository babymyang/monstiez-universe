import Link from "next/link";
import { BarChart3 } from "lucide-react";

export interface TrendingRowData {
  rank: number;
  title: string;
  artist: string;
  /** Metric shown ONLY when a real source-backed value exists. */
  metric: string | null;
  metricLabel?: string;
  url: string;
  coverTheme: string;
}

const COVER_THEMES: Record<string, [string, string]> = {
  deserve: ["#3E3A45", "#8B7BD8"],
  wego: ["#FF4F9A", "#FF9CC2"],
  sugar: ["#FFC66E", "#FF8FB0"],
  moon: ["#57505E", "#C9B8F5"],
  choom: ["#57BE95", "#CBEFDF"],
  likeit: ["#F2B33D", "#FFE7AE"],
  batter: ["#E0284B", "#FF9CC2"],
};

/** Compact numbered trending row. Metric only when source-backed (never invented). */
export default function TrendingRow({ data }: { data: TrendingRowData }) {
  const [from, to] = COVER_THEMES[data.coverTheme] ?? ["#F6CDE0", "#DCD3FA"];
  return (
    <li>
      <Link
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 py-2.5 active:opacity-80"
      >
        <span className="tnum w-5 text-center text-[15px] font-extrabold" style={{ color: "#6E5A70" }}>
          {data.rank}
        </span>
        <span
          className="shrink-0 flex items-end justify-center overflow-hidden"
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: `linear-gradient(140deg, ${from}, ${to})`,
          }}
        >
          <span
            className="font-display font-extrabold text-white/95 leading-none text-center px-1"
            style={{ fontSize: 8.5, textShadow: "0 1px 2px rgba(32,35,51,0.4)", transform: "rotate(-5deg) translateY(6px)" }}
          >
            {data.title.split(" ")[0].slice(0, 10)}
          </span>
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13.5px] font-extrabold text-ink truncate">{data.title}</span>
          <span className="block meta-text truncate">{data.artist}</span>
        </span>
        {data.metric && (
          <span className="flex items-center gap-1 shrink-0">
            <BarChart3 size={13} color="#FF4F9A" aria-hidden="true" />
            <span className="tnum text-[13px] font-extrabold" style={{ color: "#FF4F9A" }}>
              {data.metric}
            </span>
            {data.metricLabel && <span className="sr-only">{data.metricLabel}</span>}
          </span>
        )}
      </Link>
    </li>
  );
}
