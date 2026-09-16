import { createClient } from "@/lib/supabase/server";
import { DEMO_FARMER_ID } from "@/lib/constants";
import type { BatchDetail, Farm } from "@/lib/database.types";

export async function getFarmerFarms(
  farmerId: string = DEMO_FARMER_ID,
): Promise<{ farms: Farm[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("farm_name");

    if (error) {
      return { farms: [], error: error.message };
    }
    return { farms: data ?? [] };
  } catch (err) {
    return { farms: [], error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getBatchById(id: string): Promise<{
  batch: BatchDetail | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("batches")
      .select(
        `
        *,
        farms (*),
        activities (*),
        verifications (*),
        audit_logs (*)
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { batch: null, error: error.message };
    }

    if (!data) {
      return { batch: null };
    }

    const batch = data as BatchDetail;
    batch.activities = [...(batch.activities ?? [])].sort(
      (a, b) =>
        new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime(),
    );
    batch.audit_logs = [...(batch.audit_logs ?? [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return { batch };
  } catch (err) {
    return { batch: null, error: err instanceof Error ? err.message : String(err) };
  }
}
