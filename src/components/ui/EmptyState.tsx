import { Sparkles } from "lucide-react";

/** Friendly, designed empty state (what + why + what happens next). */
export default function EmptyState({
  title,
  hint,
  compact = false,
}: {
  title: string;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`card-surface flex flex-col items-center justify-center text-center ${
        compact ? "py-6 px-4" : "py-10 px-6"
      }`}
    >
      <span
        className="inline-flex items-center justify-center rounded-full mb-3"
        style={{ width: 44, height: 44, background: "#FFF9FC", border: "1px solid rgba(56,41,58,0.08)" }}
      >
        <Sparkles size={20} style={{ color: "#DCB8F0" }} aria-hidden="true" />
      </span>
      <p className="font-bold text-[14px] text-ink">{title}</p>
      {hint && <p className="meta-text mt-1 max-w-[26ch]">{hint}</p>}
    </div>
  );
}
