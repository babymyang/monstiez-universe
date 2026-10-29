import { PlayCircle, BarChart3, CalendarDays, Star } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  { href: "/discover", label: "Latest\nVideos", icon: PlayCircle, bg: "#FF4F9A", tint: "rgba(255,79,154,0.12)" },
  { href: "/stats#milestones", label: "Milestones", icon: BarChart3, bg: "#9B8EC4", tint: "rgba(155,142,196,0.14)" },
  { href: "/events", label: "Schedule", icon: CalendarDays, bg: "#57BE95", tint: "rgba(203,239,223,0.5)" },
  { href: "/members/ahyeon", label: "Members", icon: Star, bg: "#F2B33D", tint: "rgba(255,231,174,0.5)" },
] as const;

/** Four quick-action cards. */
export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {ACTIONS.map(({ href, label, icon: Icon, bg, tint }) => (
        <Link
          key={label}
          href={href}
          className="card-surface flex flex-col items-center justify-center gap-1.5 py-3.5 active:scale-[0.97] transition-transform"
          style={{ borderRadius: 18 }}
        >
          <span
            className="inline-flex items-center justify-center rounded-2xl"
            style={{ width: 40, height: 40, background: tint }}
          >
            <Icon size={21} color={bg} aria-hidden="true" />
          </span>
          <span className="text-[10.5px] font-bold text-ink text-center leading-tight whitespace-pre-line">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
