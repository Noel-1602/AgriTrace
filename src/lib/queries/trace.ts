import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/components/supabase-setup-banner";
import type { Activity, AuditLog, Batch, Farm, Verification } from "@/lib/database.types";
import { batchCodeSchema } from "@/lib/validation";

export type FarmWithFarmer = Farm & {
  farmers?: {
    id: string;
    name: string;
  } | null;
};

export type TracePayload = {
  batch: Batch;
  farm: FarmWithFarmer | null;
  activities: Activity[];
  verification: Verification | null;
  auditLogs: AuditLog[];
};

const DEMO_TRACE_PAYLOAD: TracePayload = {
  batch: {
    id: "33333333-3333-3333-3333-333333333333",
    batch_code: "AGRI-2026-001",
    farm_id: "22222222-2222-2222-2222-222222222222",
    crop_name: "Tomato",
    variety: "Anagha",
    sowing_date: "2026-06-10",
    expected_harvest_date: "2026-09-15",
    harvest_date: "2026-09-15",
    quantity: 100,
    unit: "kg",
    status: "Harvested",
    created_at: "2026-06-10T08:00:00+00:00",
  },
  farm: {
    id: "22222222-2222-2222-2222-222222222222",
    farmer_id: "11111111-1111-1111-1111-111111111111",
    farm_name: "Green Valley Farm",
    village: "Thiruvananthapuram",
    district: "Thiruvananthapuram",
    state: "Kerala",
    latitude: 8.5241,
    longitude: 76.9366,
    created_at: "2026-06-01T08:00:00+00:00",
    farmers: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Ravi Kumar",
    },
  },
  activities: [
    {
      id: "act-1",
      batch_id: "33333333-3333-3333-3333-333333333333",
      activity_type: "Sowing",
      description: "Seeds planted in prepared organic nursery beds with natural mulch",
      activity_date: "2026-06-10",
      latitude: 8.5241,
      longitude: 76.9366,
      photo_url: "https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=800&auto=format&fit=crop&q=80",
      created_at: "2026-06-10T09:00:00+00:00",
    },
    {
      id: "act-2",
      batch_id: "33333333-3333-3333-3333-333333333333",
      activity_type: "Fertilizer Application",
      description: "Organic vermicompost and cow dung manure applied to soil",
      activity_date: "2026-06-25",
      latitude: 8.5242,
      longitude: 76.9365,
      photo_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80",
      created_at: "2026-06-25T09:30:00+00:00",
    },
    {
      id: "act-3",
      batch_id: "33333333-3333-3333-3333-333333333333",
      activity_type: "Irrigation",
      description: "Drip irrigation scheduled during morning hours",
      activity_date: "2026-07-05",
      latitude: 8.5240,
      longitude: 76.9367,
      photo_url: null,
      created_at: "2026-07-05T07:15:00+00:00",
    },
    {
      id: "act-4",
      batch_id: "33333333-3333-3333-3333-333333333333",
      activity_type: "Pest Management",
      description: "Neem oil-based organic spray applied for natural pest deterrence",
      activity_date: "2026-07-20",
      latitude: 8.5241,
      longitude: 76.9366,
      photo_url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&auto=format&fit=crop&q=80",
      created_at: "2026-07-20T10:00:00+00:00",
    },
    {
      id: "act-5",
      batch_id: "33333333-3333-3333-3333-333333333333",
      activity_type: "Harvest",
      description: "100 kg ripe, premium quality Anagha tomatoes harvested",
      activity_date: "2026-09-15",
      latitude: 8.5241,
      longitude: 76.9366,
      photo_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
      created_at: "2026-09-15T14:00:00+00:00",
    },
  ],
  verification: {
    id: "ver-1",
    batch_id: "33333333-3333-3333-3333-333333333333",
    verified_by: "Officer Priya Nair",
    organization: "Green Farmers Cooperative",
    status: "VERIFIED",
    remarks: "Field inspection completed. All cultivation logs and harvest photos verified in compliance with organic traceability standards.",
    verified_at: "2026-09-16T10:00:00+00:00",
  },
  auditLogs: [
    {
      id: "audit-1",
      batch_id: "33333333-3333-3333-3333-333333333333",
      action: "Batch Created",
      field_name: "batch_code",
      old_value: null,
      new_value: "AGRI-2026-001",
      edited_by: "Ravi Kumar",
      created_at: "2026-06-10T08:00:00+00:00",
    },
    {
      id: "audit-2",
      batch_id: "33333333-3333-3333-3333-333333333333",
      action: "Activity Added",
      field_name: "activity_type",
      old_value: null,
      new_value: "Sowing",
      edited_by: "Ravi Kumar",
      created_at: "2026-06-10T09:00:00+00:00",
    },
    {
      id: "audit-3",
      batch_id: "33333333-3333-3333-3333-333333333333",
      action: "Activity Added",
      field_name: "activity_type",
      old_value: null,
      new_value: "Fertilizer Application",
      edited_by: "Ravi Kumar",
      created_at: "2026-06-25T09:30:00+00:00",
    },
    {
      id: "audit-4",
      batch_id: "33333333-3333-3333-3333-333333333333",
      action: "Harvest Recorded",
      field_name: "status",
      old_value: "Growing",
      new_value: "Harvested",
      edited_by: "Ravi Kumar",
      created_at: "2026-09-15T14:00:00+00:00",
    },
    {
      id: "audit-5",
      batch_id: "33333333-3333-3333-3333-333333333333",
      action: "Batch Verified",
      field_name: "status",
      old_value: "UNVERIFIED",
      new_value: "VERIFIED",
      edited_by: "Green Farmers Cooperative",
      created_at: "2026-09-16T10:00:00+00:00",
    },
  ],
};

export async function getBatchByCode(batchCode: string): Promise<{
  data: TracePayload | null;
  error?: string;
}> {
  const parsedCode = batchCodeSchema.safeParse(batchCode);
  if (!parsedCode.success) {
    return { data: null };
  }

  if (!isSupabaseConfigured()) {
    if (parsedCode.data === "AGRI-2026-001") {
      return { data: DEMO_TRACE_PAYLOAD };
    }
    return { data: null };
  }

  try {
    const supabase = await createClient();

    const { data: batch, error } = await supabase
      .from("batches")
      .select("*, farms(*, farmers(id, name)), activities(*), verifications(*), audit_logs(*)")
      .eq("batch_code", parsedCode.data)
      .maybeSingle();

    if (error) {
      if (parsedCode.data === "AGRI-2026-001") {
        return { data: DEMO_TRACE_PAYLOAD };
      }
      return { data: null, error: error.message };
    }
    if (!batch) {
      if (parsedCode.data === "AGRI-2026-001") {
        return { data: DEMO_TRACE_PAYLOAD };
      }
      return { data: null };
    }

    const activities = [...((batch.activities as Activity[]) ?? [])].sort(
      (a, b) =>
        new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime(),
    );

    const verifications = (batch.verifications as Verification[]) ?? [];
    const auditLogs = [...((batch.audit_logs as AuditLog[]) ?? [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return {
      data: {
        batch: batch as Batch,
        farm: (batch.farms as FarmWithFarmer | null) ?? null,
        activities,
        verification: verifications[0] ?? null,
        auditLogs,
      },
    };
  } catch {
    if (parsedCode.data === "AGRI-2026-001") {
      return { data: DEMO_TRACE_PAYLOAD };
    }
    return { data: null };
  }
}
