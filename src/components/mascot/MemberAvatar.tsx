/**
 * Original chibi kitten avatar per member — one shared template,
 * per-member fur color + accessory (design-tokens.ts memberVisuals).
 * No official photos, no rehosted media — original SVG art.
 */
import { memberVisuals, type MemberSlug } from "@/lib/design-tokens";

const ACCESSORIES: Record<string, React.ReactNode> = {
  bow: (
    <path d="M42 22 l10 6 -10 6 c-2 -4 -2 -8 0 -12 Z M62 22 l-10 6 10 6 c2 -4 2 -8 0 -12 Z" fill="#DCD3FA" />
  ),
  flower: (
    <g fill="#FFE7AE">
      <circle cx="52" cy="20" r="4.6" />
      <circle cx="46" cy="16" r="4.6" />
      <circle cx="58" cy="16" r="4.6" />
      <circle cx="49" cy="11" r="4.6" />
      <circle cx="55" cy="11" r="4.6" />
      <circle cx="52" cy="15.5" r="3.2" fill="#FF9CC2" />
    </g>
  ),
  "star-clip": (
    <path d="M62 18 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 Z" fill="#FFE7AE" />
  ),
  crown: (
    <path d="M40 20 l4 8 8 -10 8 10 4 -8 0 10 -24 0 Z" fill="#FFD34E" stroke="#E8A820" strokeWidth="1.4" strokeLinejoin="round" />
  ),
  "heart-clip": (
    <path d="M60 14 c3 -4 9 -2 9 3 c0 4 -5 8 -9 11 c-4 -3 -9 -7 -9 -11 c0 -5 6 -7 9 -3 Z" fill="#FF7FAE" />
  ),
  star: (
    <path d="M52 6 l3.2 8.4 8.8 3.6 -8.8 3.6 -3.2 8.4 -3.2 -8.4 -8.8 -3.6 8.8 -3.6 Z" fill="#C9B8F5" />
  ),
  cherry: (
    <g>
      <circle cx="47" cy="20" r="5.5" fill="#FF6B81" />
      <circle cx="58" cy="22" r="5.5" fill="#FF6B81" />
      <path d="M47 14 q6 -8 11 -1" stroke="#7BB661" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
};

export default function MemberAvatar({
  slug,
  size = 44,
  ring = false,
  className = "",
}: {
  slug: MemberSlug;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const v = memberVisuals[slug];
  const uid = `mv-${slug}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 104 104"
      fill="none"
      role="img"
      aria-label={`${v.name} avatar`}
      className={className}
      style={ring ? { outline: `3px solid ${v.accent === "#3E3A45" ? "#FF4F9A" : v.accent}`, outlineOffset: 2, borderRadius: "50%" } : undefined}
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={v.fur} />
          <stop offset="100%" stopColor={v.furDark} />
        </linearGradient>
      </defs>
      {ACCESSORIES[v.accessory]}
      {/* ears */}
      <path d="M28 52 L22 24 L48 37 Z" fill={`url(#${uid})`} />
      <path d="M31 49 L28 33 L43 41 Z" fill="#FF9CC2" />
      <path d="M76 52 L82 24 L56 37 Z" fill={`url(#${uid})`} />
      <path d="M73 49 L76 33 L61 41 Z" fill="#FF9CC2" />
      {/* head */}
      <circle cx="52" cy="62" r="34" fill={`url(#${uid})`} />
      {/* eyes */}
      <ellipse cx="40" cy="62" rx="7.4" ry="8.4" fill="#fff" />
      <ellipse cx="64" cy="62" rx="7.4" ry="8.4" fill="#fff" />
      <circle cx="41.4" cy="63" r="4.6" fill="#38293A" />
      <circle cx="62.6" cy="63" r="4.6" fill="#38293A" />
      <circle cx="43" cy="60.8" r="1.7" fill="#fff" />
      <circle cx="64.2" cy="60.8" r="1.7" fill="#fff" />
      {/* blush */}
      <circle cx="30" cy="72" r="6" fill="#FF9CC2" opacity="0.5" />
      <circle cx="74" cy="72" r="6" fill="#FF9CC2" opacity="0.5" />
      {/* mouth */}
      <path d="M47 73 q2.5 2.6 5 0 q2.5 2.6 5 0" stroke="#2E2833" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M50 68.5 h4 l-2 3 Z" fill="#FF7FAE" />
    </svg>
  );
}
