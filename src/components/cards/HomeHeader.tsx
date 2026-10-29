"use client";

import Link from "next/link";
import { Bell, Search, Heart } from "lucide-react";
import Wordmark from "@/components/app-shell/Wordmark";
import { useEffect, useState } from "react";
import { readPreferences } from "@/lib/local-storage";

/** Home header: wordmark left, search + reminders right (bell dot = local reminders only). */
export default function HomeHeader() {
  const [hasReminders, setHasReminders] = useState(false);
  useEffect(() => {
    try {
      setHasReminders(readPreferences().reminders.length > 0);
    } catch {
      /* noop */
    }
  }, []);

  return (
    <header className="sticky top-0 z-40" style={{ background: "rgba(255,249,252,0.92)", backdropFilter: "blur(10px)" }}>
      <div className="safe-top" />
      <div className="h-16 flex items-center justify-between screen-gutter">
        <Link href="/home" aria-label="MONSTIEZ Universe home" className="flex items-center gap-1.5">
          <Wordmark size="sm" />
          <Heart size={13} color="#FF4F9A" fill="#FF4F9A" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/discover" aria-label="Search content" className="icon-btn">
            <Search size={22} aria-hidden="true" />
          </Link>
          <Link href="/my-baemon" aria-label="Reminders" className="icon-btn relative">
            <Bell size={22} aria-hidden="true" />
            {hasReminders && (
              <span
                aria-hidden="true"
                className="absolute rounded-full"
                style={{ width: 8, height: 8, background: "#E0284B", top: 9, right: 9 }}
              />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
