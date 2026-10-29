import { redirect } from "next/navigation";

/** /members → default to Ahyeon (matching the reference mockup's default selection). */
export default function MembersIndexPage() {
  redirect("/members/ahyeon");
}
