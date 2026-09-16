import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export async function generateBatchCode(
  supabase: SupabaseClient<Database>,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `AGRI-${year}-`;

  const { data, error } = await supabase
    .from("batches")
    .select("batch_code")
    .like("batch_code", `${prefix}%`)
    .order("batch_code", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  let next = 1;
  if (data?.[0]?.batch_code) {
    const match = data[0].batch_code.match(/-(\d+)$/);
    if (match) {
      next = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}${String(next).padStart(3, "0")}`;
}
