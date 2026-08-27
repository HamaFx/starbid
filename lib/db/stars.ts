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
  const { data, error } = await client.rpc("get_public_star", { p_star_id: starId });
  if (error) throw error;
  return data?.[0] ? publicStarFromRow(data[0] as unknown as PublicStarRow) : null;
}
