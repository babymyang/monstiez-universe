import type { Metadata } from "next";
import ScreenHeader from "@/components/app-shell/ScreenHeader";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="app-canvas">
      <ScreenHeader title="Offline" />
      <div className="screen-gutter py-16 flex flex-col items-center text-center">
        <span
          className="inline-flex items-center justify-center rounded-full mb-4"
          style={{ width: 64, height: 64, background: "#FFF9FC", border: "1px solid rgba(56,41,58,0.08)" }}
        >
          <WifiOff size={26} color="#9B8EC4" aria-hidden="true" />
        </span>
        <h2 className="font-display font-extrabold text-[20px] text-ink">You&apos;re offline</h2>
        <p className="meta-text mt-2 max-w-[30ch]">
          The app shell is cached and works offline. Live content links and remote media need a connection.
        </p>
        <p className="meta-text mt-4 !text-[11px]">A fan-made app for MONSTIEZ ♡</p>
      </div>
    </main>
  );
}
