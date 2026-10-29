import Link from "next/link";
import { Play } from "lucide-react";
import Thumb from "@/components/ui/Thumb";

export interface VideoCardData {
  id: string;
  videoId: string;
  title: string;
  meta: string;
  duration: string | null;
  url: string;
}

/** Horizontal content card for "Latest from BABYMONSTER". */
export default function VideoCard({ data }: { data: VideoCardData }) {
  return (
    <div className="card-surface p-2.5 w-[190px] shrink-0" style={{ borderRadius: 18 }}>
      <Link href={data.url} target="_blank" rel="noopener noreferrer" className="block relative group">
        <Thumb videoId={data.videoId} alt={data.title} duration={data.duration} size="md" label="OFFICIAL MV" />
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto flex items-center justify-center rounded-full pointer-events-none"
          style={{ width: 34, height: 34, left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "rgba(32,35,51,0.55)" }}
        >
          <Play size={16} color="#fff" fill="#fff" />
        </span>
      </Link>
      <Link href={data.url} target="_blank" rel="noopener noreferrer" className="block mt-2 px-0.5">
        <p className="text-[12.5px] font-extrabold text-ink leading-snug line-clamp-2">
          {data.title}
        </p>
        <p className="meta-text mt-1 line-clamp-1">{data.meta}</p>
      </Link>
    </div>
  );
}
