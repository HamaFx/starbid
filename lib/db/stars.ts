import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import { publicStarFromRow, type PublicStarRow, type Star } from "@/lib/types";

export async function listPublicStars(
  client: SupabaseClient<Database>,
): Promise<Star[]> {
  const { data, error } = await client.rpc("list_public_stars");

  if (error) throw error;
  return (data as unknown as PublicStarRow[]).map(publicStarFromRow);
}

export async function getPublicStar(
  client: SupabaseClient<Database>,
  starId: string,
): Promise<Star | null> {
  const stars = await listPublicStars(client);
  return stars.find((star) => star.id === starId) ?? null;
}
