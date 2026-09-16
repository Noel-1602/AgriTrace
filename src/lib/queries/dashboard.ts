import { createClient } from "@/lib/supabase/server";
import { DEMO_FARMER_ID } from "@/lib/constants";
import type { BatchWithFarm, Farmer } from "@/lib/database.types";

export type DashboardData = {
  farmer: Farmer | null;
  stats: {
    totalBatches: number;
    activeCrops: number;
    harvested: number;
    verified: number;
  };
  recentBatches: BatchWithFarm[];
  error?: string;
};

export async function getDashboardData(
  farmerId: string = DEMO_FARMER_ID,
): Promise<DashboardData> {
  try {
    const supabase = await createClient();

    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select("*")
      .eq("id", farmerId)
      .maybeSingle();

    if (farmerError) {
      return emptyDashboard(`Could not connect to Supabase: ${farmerError.message}`);
    }

    const { data: farms } = await supabase
      .from("farms")
      .select("id")
      .eq("farmer_id", farmerId);

    const farmIds = farms?.map((f) => f.id) ?? [];

    if (farmIds.length === 0) {
      return {
        farmer,
        stats: {
          totalBatches: 0,
          activeCrops: 0,
          harvested: 0,
          verified: 0,
        },
        recentBatches: [],
      };
    }

    const { data: batches, error: batchError } = await supabase
      .from("batches")
      .select("*, farms(*)")
      .in("farm_id", farmIds)
      .order("created_at", { ascending: false });

    if (batchError) {
      return emptyDashboard(`Could not load batches: ${batchError.message}`);
    }

    const batchList = (batches ?? []) as BatchWithFarm[];
    const batchIds = batchList.map((b) => b.id);

    let verifiedCount = 0;
    if (batchIds.length > 0) {
      const { data: verifications } = await supabase
        .from("verifications")
        .select("batch_id, status")
        .in("batch_id", batchIds)
        .eq("status", "VERIFIED");
      verifiedCount = verifications?.length ?? 0;
    }

    const activeCrops = new Set(
      batchList.filter((b) => b.status === "Growing").map((b) => b.crop_name),
    ).size;

    return {
      farmer,
      stats: {
        totalBatches: batchList.length,
        activeCrops,
        harvested: batchList.filter((b) => b.status === "Harvested").length,
        verified: verifiedCount,
      },
      recentBatches: batchList.slice(0, 8),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return emptyDashboard(
      `Could not connect to Supabase (${msg}). Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.`,
    );
  }
}

function emptyDashboard(error: string): DashboardData {
  return {
    farmer: null,
    stats: {
      totalBatches: 0,
      activeCrops: 0,
      harvested: 0,
      verified: 0,
    },
    recentBatches: [],
    error,
  };
}
