import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberDetailClient, { MemberPageData } from "@/components/cards/MemberDetailClient";
import { members, contentItems, events, latestSnapshot } from "@/lib/data";
import { memberOrder, type MemberSlug } from "@/lib/design-tokens";
import { formatDate } from "@/lib/formatters";

export function generateStaticParams() {
  return memberOrder.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = members.find((m) => m.slug === slug);
  return { title: member ? member.name : "Members" };
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = members.find((m) => m.slug === slug.toLowerCase());
  if (!member || !memberOrder.includes(slug as MemberSlug)) notFound();

  // verified group content — includes this member by definition of the group
  const content = contentItems
    .filter((c) => c.status === "verified")
    .map((c) => {
      const snap = latestSnapshot(c.videoId);
      return {
        id: c.id,
        videoId: c.videoId,
        title: c.title,
        type: c.type,
        duration: c.duration,
        url: c.url,
        releaseDate: c.releaseDate,
        viewsText: snap ? `${(snap.value / 1e6).toFixed(1)}M views (observed)` : null,
      };
    });

  const moments = events
    .filter((e) => e.state === "completed" && e.status === "verified" && e.date)
    .slice(0, 4)
    .map((e) => ({
      id: e.id,
      label: e.title,
      detail: e.venue && e.city ? `${e.venue}, ${e.city}` : "Official schedule",
      dateText: formatDate(e.date!),
      url: e.sourceUrl,
    }));

  const data: MemberPageData = {
    slug: member.slug as MemberSlug,
    name: member.name,
    order: member.order,
    birthDate: member.birthDate,
    birthDateSource: member.birthDateSource,
    verifiedAt: member.verifiedAt,
    content,
    moments,
  };

  return <MemberDetailClient data={data} />;
}
