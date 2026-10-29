/**
 * MONSTIEZ universe wordmark — original rendering: chunky Baloo 2 display
 * letters with navy stroke (SVG paint-order) + rounded "universe" script line.
 */
export default function Wordmark({
  size = "lg",
  stacked = true,
}: {
  size?: "sm" | "lg";
  stacked?: boolean;
}) {
  const mono = size === "lg" ? 44 : 22;
  const sub = size === "lg" ? 22 : 12;
  const w = Math.round(mono * 5.75);
  const h = Math.round(mono * 1.42);
  return (
    <span
      className="inline-flex flex-col items-start leading-none select-none"
      style={{ gap: size === "lg" ? 2 : 1 }}
      aria-label="MONSTIEZ universe"
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        role="presentation"
        aria-hidden="true"
      >
        <text
          x="4"
          y={mono * 1.02}
          fontFamily="'Baloo 2', 'Nunito Sans', system-ui, sans-serif"
          fontWeight={800}
          fontSize={mono}
          letterSpacing="0.5"
          fill="#FF4F9A"
          stroke="#202333"
          strokeWidth={size === "lg" ? 7 : 4}
          strokeLinejoin="round"
          paintOrder="stroke"
          style={{ paintOrder: "stroke" }}
        >
          MONSTIEZ
        </text>
      </svg>
      {stacked && (
        <span
          className="font-display italic"
          style={{
            fontSize: sub,
            color: "#9B8EC4",
            fontWeight: 700,
            letterSpacing: "0.02em",
            marginTop: size === "lg" ? -6 : -2,
            alignSelf: size === "lg" ? "center" : "flex-end",
          }}
        >
          universe
        </span>
      )}
    </span>
  );
}
