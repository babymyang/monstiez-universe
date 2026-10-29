"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown, Heart, Sparkle, Star } from "lucide-react";
import Mascot from "@/components/mascot/Mascot";
import { useLocalPreferences } from "@/hooks/use-preferences";

const SLIDES = [
  {
    tagline: "YOUR BABYMONSTER CORNER",
    copy: ["Discover · Track · Celebrate", "Everything BABYMONSTER in one place."],
    cta: "Join MONSTIEZ",
  },
  {
    tagline: "FOLLOW YOUR BIAS",
    copy: ["Pick your favorite member", "and keep their content close."],
    cta: "Meet the members",
  },
  {
    tagline: "TRACK REAL MILESTONES",
    copy: ["Sourced stats and moments", "— never made-up numbers."],
    cta: "See the stats",
  },
] as const;

const SLIDE_HREF = ["/home", "/members/ahyeon", "/stats"] as const;

export default function WelcomeScreen() {
  const [slide, setSlide] = useState(0);
  const [prefs] = useLocalPreferences();
  const returning = prefs.onboarded;

  const s = SLIDES[slide];

  return (
    <main
      className="app-canvas relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(175deg, #FBE0EE 0%, #F6CDE0 34%, #EFDDF7 62%, #FFF9FC 100%)",
      }}
    >
      {/* floating doodles */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <Crown className="float-soft absolute" style={{ top: 42, left: "50%", marginLeft: -15 }} size={30} strokeWidth={1.8} color="#38293A" fill="#FFE7AE" />
        <Sparkle className="twinkle absolute" style={{ top: 128, left: 46 }} size={16} color="#FF4F9A" fill="#FF4F9A" />
        <Star className="twinkle absolute" style={{ top: 100, right: 52, animationDelay: "0.6s" }} size={18} color="#9B8EC4" fill="#DCD3FA" />
        <Sparkle className="twinkle absolute" style={{ top: 200, right: 110, animationDelay: "0.4s" }} size={12} color="#C9B8F5" fill="#C9B8F5" />
        <Heart className="float-soft absolute" style={{ top: 316, left: 34, animationDelay: "1.2s" }} size={20} color="#FF7FAE" fill="#FF7FAE" />
        <Star className="twinkle absolute" style={{ top: 430, right: 36, animationDelay: "1s" }} size={14} color="#FFC66E" fill="#FFE7AE" />
        <Sparkle className="twinkle absolute" style={{ bottom: 270, right: 84, animationDelay: "0.3s" }} size={13} color="#C9B8F5" fill="#C9B8F5" />
        <Star className="twinkle absolute" style={{ bottom: 320, left: 70, animationDelay: "0.8s" }} size={13} color="#DCD3FA" fill="#DCD3FA" />
      </div>

      {returning && (
        <div
          className="absolute z-10"
          style={{ top: 88, left: "50%", transform: "translateX(-50%)" }}
        >
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold"
            style={{ background: "rgba(255,255,255,0.85)", color: "#FF4F9A", border: "1px solid rgba(255,79,154,0.25)" }}
          >
            Welcome back ♡
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pt-20">
        {/* wordmark */}
        <div className="relative">
          <svg width="248" height="74" viewBox="0 0 248 74" role="img" aria-label="MONSTIEZ universe">
            <text
              x="6" y="48"
              fontFamily="'Baloo 2','Nunito Sans',system-ui,sans-serif"
              fontWeight={800} fontSize="46" letterSpacing="1"
              fill="#FF4F9A" stroke="#202333" strokeWidth="8"
              strokeLinejoin="round" paintOrder="stroke" style={{ paintOrder: "stroke" }}
            >
              MONSTIEZ
            </text>
            <text
              x="124" y="70" textAnchor="middle"
              fontFamily="'Baloo 2','Nunito Sans',system-ui,sans-serif"
              fontWeight={700} fontSize="24" fontStyle="italic"
              fill="#9B8EC4"
            >
              universe
            </text>
          </svg>
        </div>

        <p
          className="mt-5 font-extrabold text-[13px] text-ink"
          style={{ letterSpacing: "0.28em" }}
        >
          {s.tagline} <Heart size={13} className="inline -mt-0.5" color="#FF4F9A" fill="#FF4F9A" aria-hidden="true" />
        </p>

        <div className="mt-14 mb-2 relative">
          <Mascot size={196} />
          {/* speech bubble heart */}
          <div
            aria-hidden="true"
            className="absolute"
            style={{ top: 6, right: -14 }}
          >
            <div
              className="flex items-center justify-center rounded-full card-surface float-soft"
              style={{ width: 40, height: 40 }}
            >
              <Heart size={17} color="#FF4F9A" fill="#FF4F9A" />
            </div>
          </div>
          {/* BAEMON doodle */}
          <span
            aria-hidden="true"
            className="font-display font-bold absolute text-[15px]"
            style={{ right: -30, bottom: 46, color: "#38293A", transform: "rotate(-8deg)" }}
          >
            BAEMON
          </span>
        </div>

        <p className="mt-4 text-[15px] text-ink leading-relaxed font-semibold">
          {s.copy[0]}
          <br />
          {s.copy[1]}
        </p>
      </div>

      <div className="px-8 pb-8 w-full flex flex-col items-center">
        <Link
          href={SLIDE_HREF[slide]}
          className="w-full max-w-[330px] h-[54px] rounded-full flex items-center justify-center gap-2 text-white font-extrabold text-[16px] transition-transform active:scale-[0.98]"
          style={{ background: "#202333", boxShadow: "0 12px 28px rgba(32,35,51,0.28)" }}
          onClick={() => {
            try {
              // dynamic import avoided; prefs helper is client-only
              import("@/lib/local-storage").then(({ updatePreferences }) =>
                updatePreferences((p) => ({ ...p, onboarded: true })),
              );
            } catch {
              /* noop */
            }
          }}
        >
          {s.cta}
          <ArrowRight size={19} aria-hidden="true" />
        </Link>

        {/* functional slide dots */}
        <div className="flex items-center gap-2 mt-5" role="tablist" aria-label="Welcome slides">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={slide === i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setSlide(i)}
              className="rounded-full transition-all"
              style={{
                width: slide === i ? 22 : 8,
                height: 8,
                background: slide === i ? "#FF4F9A" : "#E3BFD4",
              }}
            />
          ))}
        </div>

        <p className="meta-text mt-4 text-center">
          A fan-made app for MONSTIEZ <Heart size={10} className="inline" color="#FF7FAE" fill="#FF7FAE" aria-hidden="true" />
          <br />
          Not affiliated with YG Entertainment or BABYMONSTER.
        </p>
      </div>
    </main>
  );
}
