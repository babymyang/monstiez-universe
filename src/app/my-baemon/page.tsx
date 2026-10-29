import type { Metadata } from "next";
import MyBaemonClient from "@/components/cards/MyBaemonClient";
import { contentItems } from "@/lib/data";

export const metadata: Metadata = { title: "My Baemon" };

export default function MyBaemonPage() {
  const contentTitles: Record<string, string> = {};
  for (const c of contentItems) contentTitles[c.id] = c.title.replace("BABYMONSTER - ", "");
  return <MyBaemonClient contentTitles={contentTitles} />;
}
