import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Section title with optional "See all" action. */
export default function SectionHeader({
  title,
  href,
  seeAllLabel = "See all",
}: {
  title: string;
  href?: string;
  seeAllLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="section-title flex items-center gap-1">
        {title}
        {href && <ChevronRight size={18} className="text-ink-soft" aria-hidden="true" />}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-[13px] font-bold"
          style={{ color: "#FF4F9A" }}
        >
          {seeAllLabel}
        </Link>
      )}
    </div>
  );
}
