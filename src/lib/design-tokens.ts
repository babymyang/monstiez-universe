/**
 * DESIGN TOKENS — single source of truth (mirrors docs/DESIGN_TOKENS.md).
 * Identity: cotton-candy pastel pink on cloud white, ink-berry text,
 * chunky rounded cards, Nunito Sans + Baloo 2, MONSTIEZ pink accent.
 */
export const colors = {
  cotton: "#F6CDE0",
  accent: "#FF4F9A",
  lilac: "#DCD3FA",
  mint: "#CBEFDF",
  butter: "#FFE7AE",
  cloud: "#FFF9FC",
  surface: "#FFFFFF",
  ink: "#38293A",
  inkSoft: "#6E5A70",
  navy: "#202333",
  danger: "#E0284B",
} as const;

export type MemberSlug =
  | "ruka"
  | "pharita"
  | "asa"
  | "ahyeon"
  | "rami"
  | "rora"
  | "chiquita";

export interface MemberVisual {
  slug: MemberSlug;
  name: string;
  accent: string;
  accentTint: string;
  fur: string;
  furDark: string;
  accessory: "bow" | "flower" | "star-clip" | "crown" | "heart-clip" | "star" | "cherry";
}

/** Per-member accent map — color NEVER carries meaning alone (paired with name labels everywhere). */
export const memberVisuals: Record<MemberSlug, MemberVisual> = {
  ruka: { slug: "ruka", name: "RUKA", accent: "#3E3A45", accentTint: "rgba(62,58,69,0.10)", fur: "#57505E", furDark: "#3E3A45", accessory: "bow" },
  pharita: { slug: "pharita", name: "PHARITA", accent: "#F2B8CF", accentTint: "rgba(242,184,207,0.16)", fur: "#F7E3D9", furDark: "#D9A895", accessory: "flower" },
  asa: { slug: "asa", name: "ASA", accent: "#A8C6F2", accentTint: "rgba(168,198,242,0.16)", fur: "#DCE9FA", furDark: "#A8C6F2", accessory: "star-clip" },
  ahyeon: { slug: "ahyeon", name: "AHYEON", accent: "#FF4F9A", accentTint: "rgba(255,79,154,0.12)", fur: "#6B5A66", furDark: "#514249", accessory: "crown" },
  rami: { slug: "rami", name: "RAMI", accent: "#CBEFDF", accentTint: "rgba(203,239,223,0.20)", fur: "#EFFAF4", furDark: "#B8DFCC", accessory: "heart-clip" },
  rora: { slug: "rora", name: "RORA", accent: "#C9B8F5", accentTint: "rgba(201,184,245,0.16)", fur: "#F0EAFB", furDark: "#C9B8F5", accessory: "star" },
  chiquita: { slug: "chiquita", name: "CHIQUITA", accent: "#FFC66E", accentTint: "rgba(255,198,110,0.16)", fur: "#FFE9CF", furDark: "#F2C08A", accessory: "cherry" },
};

export const memberOrder: MemberSlug[] = [
  "ruka", "pharita", "asa", "ahyeon", "rami", "rora", "chiquita",
];

export const radii = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 } as const;

export const zIndex = { nav: 50, header: 40 } as const;
