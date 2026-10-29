import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Compact header with back navigation + centered title (Stats / Members screens). */
export default function ScreenHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40" style={{ background: "rgba(255,249,252,0.92)", backdropFilter: "blur(10px)" }}>
      <div className="safe-top" />
      <div className="relative h-14 flex items-center justify-center screen-gutter">
        <Link
          href="/home"
          aria-label="Back to Home"
          className="icon-btn absolute left-3 top-1/2 -translate-y-1/2"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </Link>
        <h1 className="text-[17px] font-extrabold text-ink">{title}</h1>
      </div>
    </header>
  );
}
