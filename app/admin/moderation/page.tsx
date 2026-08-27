import { cookies } from "next/headers";
import { getModerationQueue } from "@/app/admin/moderation/actions";
import { isAdminAuthorized } from "@/lib/admin/auth";
import { ModerationActions } from "@/components/admin/ModerationActions";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ModerationPage() {
  const authorized = isAdminAuthorized((await cookies()).get("gravitywell_admin")?.value);
  if (!authorized) return <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]"><div className="mx-auto max-w-4xl"><h1 className="text-3xl font-semibold">Admin authorization required</h1><p className="mt-3 text-sm text-[#8f8c96]">This internal moderation surface is not publicly available.</p></div></main>;
  const flags = await getModerationQueue();
  return <main className="min-h-screen bg-[#05050a] px-6 py-16 text-[#fff4e0]"><div className="mx-auto max-w-4xl"><h1 className="text-3xl font-semibold">Moderation queue</h1><p className="mt-3 text-sm text-[#8f8c96]">Pending reports require review.</p><div className="mt-8 space-y-3">{flags.map((flag) => <article key={flag.id} className="rounded-xl border border-white/10 bg-[#0a0a14] p-4"><div className="flex justify-between gap-4"><span className="font-mono text-xs text-[#f43f5e]">{flag.source}</span><time className="font-mono text-xs text-[#8f8c96]">{flag.created_at}</time></div><p className="mt-3 text-sm">{flag.reason}</p><p className="mt-2 font-mono text-xs text-[#8f8c96]">Project {flag.project_id}</p><ModerationActions flagId={flag.id} projectId={flag.project_id} /></article>)}{!flags.length && <p className="text-sm text-[#8f8c96]">Queue is clear.</p>}</div></div></main>;
}
