import { createClient } from "@/lib/supabase/server";
import { DEMO_FARMER_ID } from "@/lib/constants";
import type { BatchDetail, Farm } from "@/lib/database.types";

const FALLBACK_DEMO_FARM: Farm = {
  id: "22222222-2222-2222-2222-222222222222",
  farmer_id: "11111111-1111-1111-1111-111111111111",
  farm_name: "Green Valley Farm",
  village: "Thiruvananthapuram",
  district: "Thiruvananthapuram",
  state: "Kerala",
  latitude: 8.5241,
  longitude: 76.9366,
  created_at: "2026-06-01T08:00:00+00:00",
};

export async function getFarmerFarms(
  farmerId: string = DEMO_FARMER_ID,
): Promise<{ farms: Farm[]; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Try querying farms for the specific farmer
    const { data: farmerFarms, error: farmerError } = await supabase
      .from("farms")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("farm_name");

    if (farmerFarms && farmerFarms.length > 0) {
      return { farms: farmerFarms };
    }

    // 2. If no farms matched DEMO_FARMER_ID, fetch any available farms in the database
    const { data: allFarms, error: allError } = await supabase
      .from("farms")
      .select("*")
      .order("farm_name");

    if (allFarms && allFarms.length > 0) {
      return { farms: allFarms };
    }

    if (farmerError || allError) {
      return { farms: [FALLBACK_DEMO_FARM] };
    }

    // 3. Fallback demo farm if database is empty
    return { farms: [FALLBACK_DEMO_FARM] };
  } catch {
    return { farms: [FALLBACK_DEMO_FARM] };
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
