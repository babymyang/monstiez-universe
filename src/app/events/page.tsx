import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Ticket, ArrowRight } from "lucide-react";
import ScreenHeader from "@/components/app-shell/ScreenHeader";
import BottomNav from "@/components/bottom-nav/BottomNav";
import EmptyState from "@/components/ui/EmptyState";
import { events } from "@/lib/data";
import { formatDate } from "@/lib/formatters";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  const upcoming = events
    .filter((e) => (e.state === "upcoming" || e.state === "announced") && e.status === "verified")
    .sort((a, b) => ((a.date ?? "9999") < (b.date ?? "9999") ? -1 : 1));
  const completed = events
    .filter((e) => e.state === "completed" && e.status === "verified")
    .sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : -1));

  return (
    <main className="app-canvas" style={{ paddingBottom: 96 }}>
      <ScreenHeader title="Events" />

      <div className="screen-gutter pt-2 space-y-5">
        <section aria-label="Upcoming events">
          <h2 className="section-title mb-2.5">Upcoming</h2>
          {upcoming.length > 0 ? (
            <ul className="space-y-2.5">
              {upcoming.map((e) => (
                <li key={e.id} className="card-surface p-4" style={{ borderRadius: 20 }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-extrabold text-ink leading-tight">{e.title}</p>
                      <p className="meta-text mt-1 flex items-center gap-1 flex-wrap">
                        {e.city && (
                          <span className="inline-flex items-center gap-0.5">
                            <MapPin size={11} aria-hidden="true" /> {e.city}
                            {e.venue ? ` · ${e.venue}` : ""}
                          </span>
                        )}
                      </p>
                      <p className="text-[12.5px] font-extrabold tnum mt-1.5" style={{ color: "#FF4F9A" }}>
                        {e.date ? formatDate(e.date) : "Date not confirmed"}
                        {e.endDate && e.endDate !== e.date ? ` – ${formatDate(e.endDate)}` : ""}
                      </p>
                      <p className="meta-text mt-1.5">
                        <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-dotted">
                          Verified source
                        </a>
                        {" · "}times in venue local time
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                      style={{
                        background: e.state === "upcoming" ? "rgba(255,79,154,0.12)" : "rgba(255,231,174,0.4)",
                        color: e.state === "upcoming" ? "#FF4F9A" : "#B98A1F",
                      }}
                    >
                      {e.state === "upcoming" ? "Confirmed" : "Announced"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact title="No upcoming dates confirmed" hint="Dates appear only after official confirmation." />
          )}
        </section>

        <section aria-label="Recent events">
          <h2 className="section-title mb-2.5">Recent</h2>
          <ul className="card-surface divide-y divide-hairline px-4" style={{ borderRadius: 18 }}>
            {completed.map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-ink truncate">{e.title}</p>
                  <p className="meta-text truncate">
                    {e.city}
                    {e.venue ? ` · ${e.venue}` : ""} · {e.date ? formatDate(e.date) : ""}
                  </p>
                </div>
                <a
                  href={e.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-label="Source"
                  className="shrink-0 text-[11px] font-bold underline decoration-dotted"
                  style={{ color: "#6E5A70" }}
                >
                  Source
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-surface p-4" style={{ borderRadius: 20, background: "linear-gradient(120deg,#FBDCEB,#F3DBF2)" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Ticket size={16} color="#FF4F9A" aria-hidden="true" />
            <h2 className="text-[13.5px] font-extrabold text-ink">Tickets</h2>
          </div>
          <p className="meta-text">
            This fan app does not sell tickets. Official ticketing links live on the YG artist page.
          </p>
          <a
            href="https://ygfamily.com/en/artists/babymonster/concert"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-2.5 inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-navy text-white text-[12.5px] font-extrabold"
          >
            YG official concert page <ArrowRight size={14} aria-hidden="true" />
          </a>
        </section>

        <p className="meta-text !text-[10.5px] text-center pb-2">
          Fan-made · not affiliated with YG Entertainment or BABYMONSTER.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
