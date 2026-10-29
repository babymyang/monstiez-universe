import { Link2 } from "lucide-react";

/** Source attribution + freshness stamp for data-driven cards (brief §1.7). */
export default function SourceBadge({
  sourceUrl,
  sourceLabel,
  observedAt,
  stale = false,
}: {
  sourceUrl: string;
  sourceLabel?: string;
  observedAt?: string;
  stale?: boolean;
}) {
  return (
    <p className="meta-text flex items-center gap-1 flex-wrap">
      <Link2 size={12} aria-hidden="true" />
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline decoration-dotted underline-offset-2 hover:opacity-80"
      >
        {sourceLabel ?? "Source"}
      </a>
      {observedAt && (
        <span>
          · updated{" "}
          {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
            new Date(observedAt),
          )}
        </span>
      )}
      {stale && (
        <span className="font-bold" style={{ color: "#B98A1F" }}>
          · may be stale
        </span>
      )}
    </p>
  );
}
