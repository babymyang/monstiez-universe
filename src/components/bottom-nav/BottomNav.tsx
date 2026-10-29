"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ChartNoAxesColumn, CalendarDays, UserRound } from "lucide-react";

const DESTS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/stats", label: "Stats", icon: ChartNoAxesColumn },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/my-baemon", label: "My Baemon", icon: UserRound },
] as const;

/** Persistent bottom navigation — shared by Home / Discover / Stats / Events / My Baemon. */
export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 border-t border-hairline"
      style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(10px)" }}
    >
      <ul className="grid grid-cols-5 safe-bottom">
        {DESTS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 min-h-[56px] pt-1.5"
                style={{ color: active ? "#FF4F9A" : "#6E5A70" }}
              >
                <Icon size={21} strokeWidth={active ? 2.6 : 2} aria-hidden="true" />
                <span
                  className="text-[9.5px] font-bold whitespace-nowrap"
                  style={{ letterSpacing: "0" }}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
