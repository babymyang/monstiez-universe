/**
 * Original chibi dark-kitten mascot for MONSTIEZ Universe.
 * Hand-drawn SVG — 100% original artwork (no official marks, no third-party assets).
 */
export default function Mascot({ size = 190, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      role="img"
      aria-label="MONSTIEZ chibi kitten mascot"
      className={className}
    >
      <defs>
        <linearGradient id="fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#57505E" />
          <stop offset="100%" stopColor="#3B3441" />
        </linearGradient>
        <radialGradient id="blush" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FF9CC2" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FF9CC2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* tail */}
      <path
        d="M150 165 C 178 158, 182 130, 168 118 C 180 132, 172 152, 148 158 Z"
        fill="#3B3441"
      />

      {/* body */}
      <ellipse cx="100" cy="172" rx="52" ry="26" fill="url(#fur)" />
      {/* front paws */}
      <ellipse cx="78" cy="184" rx="15" ry="10" fill="#4A414F" />
      <ellipse cx="122" cy="184" rx="15" ry="10" fill="#4A414F" />
      <path d="M72 182 q2 4 5 0 M78 183 q2 4 5 0 M116 183 q2 4 5 0 M122 182 q2 4 5 0" stroke="#2E2833" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* ears */}
      <path d="M52 62 L46 26 L82 44 Z" fill="url(#fur)" />
      <path d="M55 58 L52 36 L74 47 Z" fill="#FF9CC2" />
      <path d="M148 62 L154 26 L118 44 Z" fill="url(#fur)" />
      <path d="M145 58 L148 36 L126 47 Z" fill="#FF9CC2" />

      {/* head */}
      <ellipse cx="100" cy="98" rx="62" ry="56" fill="url(#fur)" />
      {/* head fur tufts */}
      <path d="M70 48 q6 8 2 14 M100 42 q0 8 -4 12 M130 48 q-6 8 -2 14" stroke="#2E2833" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* eyes */}
      <ellipse cx="76" cy="96" rx="13.5" ry="15" fill="#FFFFFF" />
      <ellipse cx="124" cy="96" rx="13.5" ry="15" fill="#FFFFFF" />
      <circle cx="78" cy="98" r="8.5" fill="#38293A" />
      <circle cx="122" cy="98" r="8.5" fill="#38293A" />
      <circle cx="81" cy="94" r="3.4" fill="#FFFFFF" />
      <circle cx="125" cy="94" r="3.4" fill="#FFFFFF" />
      <circle cx="75.5" cy="102.5" r="1.8" fill="#FFFFFF" opacity="0.9" />
      <circle cx="119.5" cy="102.5" r="1.8" fill="#FFFFFF" opacity="0.9" />

      {/* blush */}
      <circle cx="58" cy="114" r="11" fill="url(#blush)" />
      <circle cx="142" cy="114" r="11" fill="url(#blush)" />

      {/* nose + w-mouth */}
      <path d="M96 112 h8 l-4 5 Z" fill="#FF7FAE" />
      <path d="M92 121 q4 4 8 0 q4 4 8 0" stroke="#2E2833" strokeWidth="2.6" strokeLinecap="round" fill="none" />

      {/* whiskers */}
      <path d="M30 104 h16 M32 114 h14 M154 104 h16 M154 114 h14" stroke="#2E2833" strokeWidth="2" strokeLinecap="round" opacity="0.65" />

      {/* one ear-flick sparkle */}
      <path d="M164 40 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 Z" fill="#FFE7AE" className="twinkle" />
    </svg>
  );
}
