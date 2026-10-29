"use client";

import { useMemo, useState } from "react";
import HomeHeader from "@/components/cards/HomeHeader";
import CountdownCard, { CountdownData } from "@/components/cards/CountdownCard";
import QuickActions from "@/components/cards/QuickActions";
import VideoCard, { VideoCardData } from "@/components/cards/VideoCard";
import TrendingRow, { TrendingRowData } from "@/components/cards/TrendingRow";
import SectionHeader from "@/components/ui/SectionHeader";
import ChipRow from "@/components/ui/ChipRow";
import EmptyState from "@/components/ui/EmptyState";
import BottomNav from "@/components/bottom-nav/BottomNav";
import { useLocalPreferences } from "@/hooks/use-preferences";

export interface HomeData {
  countdown: CountdownData | null;
  latest: VideoCardData[];
  latestAllHref: string;
  trending: TrendingRowData[];
  news: VideoCardData[];
  upcoming: { id: string; title: string; date: string; city: string | null; venue: string | null; url: string }[];
  forYou: VideoCardData[];
}

const CHIPS = [
  { value: "all", label: "All" },
  { value: "videos", label: "Videos" },
  { value: "news", label: "News" },
  { value: "events", label: "Events" },
  { value: "foryou", label: "For You" },
];

export default function HomeClient({ data }: { data: HomeData }) {
  const [chip, setChip] = useState("all");
  const [prefs] = useLocalPreferences();
  const bias = prefs.bias;

  const forYouItems = useMemo(() => {
    if (!bias) return [];
    return data.forYou.filter((v) =>
      v.title.toLowerCase().includes(bias.toLowerCase()),
    );
  }, [bias, data.forYou]);

  return (
    <main className="app-canvas" style={{ paddingBottom: 96 }}>
      <HomeHeader />

      <div className="screen-gutter pt-2 space-y-5">
        <ChipRow options={CHIPS} value={chip} onChange={setChip} ariaLabel="Feed categories" />

        {(chip === "all" || chip === "events" || chip === "foryou") && (
          <section aria-label="Next moment">
            {data.countdown ? (
              <CountdownCard data={data.countdown} />
            ) : (
              <EmptyState
                title="No upcoming date confirmed"
                hint="A countdown appears here only when an official source confirms a date."
                compact
              />
            )}
          </section>
        )}

        {chip === "events" && data.upcoming.length > 0 && (
          <section aria-label="Upcoming schedule">
            <SectionHeader title="Upcoming stops" href="/events" />
            <ul className="card-surface divide-y divide-hairline px-4" style={{ borderRadius: 18 }}>
              {data.upcoming.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[13px] font-extrabold text-ink">{e.city} · {e.venue}</p>
                    <p className="meta-text tnum">{e.title}</p>
                  </div>
                  <span className="tnum text-[13px] font-extrabold" style={{ color: "#FF4F9A" }}>
                    {e.date}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {chip === "foryou" && (
          <section aria-label="For you">
            {bias ? (
              forYouItems.length > 0 ? (
                <ul className="space-y-2">
                  {forYouItems.map((v) => (
                    <li key={v.id} className="flex">
                      <VideoCard data={v} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title={`Nothing tagged ${bias} yet`}
                  hint="Curated member content will appear here as it is verified."
                  compact
                />
              )
            ) : (
              <EmptyState
                title="Pick a bias first"
                hint="Choose your favorite member in My Baemon and their content shows up here."
                compact
              />
            )}
          </section>
        )}

        <QuickActions />

        {(chip === "all" || chip === "videos") && (
          <section aria-label="Latest from BABYMONSTER">
            <SectionHeader title="Latest from BABYMONSTER" href={data.latestAllHref} />
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
              {data.latest.map((v) => (
                <VideoCard key={v.id} data={v} />
              ))}
            </div>
          </section>
        )}

        {(chip === "all" || chip === "videos") && data.trending.length > 0 && (
          <section aria-label="Trending now">
            <SectionHeader title="Trending Now" href="/discover" />
            <ul className="card-surface px-4" style={{ borderRadius: 18 }}>
              {data.trending.map((t) => (
                <TrendingRow key={t.rank} data={t} />
              ))}
            </ul>
          </section>
        )}

        {(chip === "all" || chip === "news") && data.news.length > 0 && (
          <section aria-label="News and behind the scenes">
            <SectionHeader title="News & Behind" href="/discover" />
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
              {data.news.map((v) => (
                <VideoCard key={v.id} data={v} />
              ))}
            </div>
          </section>
        )}

        <p className="meta-text text-center !text-[11px] pb-2">
          Fan-made · not affiliated with YG Entertainment or BABYMONSTER.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
