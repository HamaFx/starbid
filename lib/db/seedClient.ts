import { createSupabaseBrowserClient } from "@/lib/db/browserClient";
import { listPublicStars } from "@/lib/db/stars";

export async function loadPublicStars() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return [];
  try { return await listPublicStars(createSupabaseBrowserClient()); } catch { return []; }
}
