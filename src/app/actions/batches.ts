"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateBatchCode } from "@/lib/batch-code";
import { createClient } from "@/lib/supabase/server";
import { getFarmerFarms } from "@/lib/queries/batches";
import { createBatchSchema, updateBatchSchema } from "@/lib/validation";

export type ActionResult = { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean };

export async function createBatchAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let farmId = String(formData.get("farm_id") ?? "").trim();
  if (!farmId) {
    const { farms } = await getFarmerFarms();
    if (farms.length > 0) {
      farmId = farms[0].id;
    }
  }

  const raw = {
    farm_id: farmId,
    crop_name: String(formData.get("crop_name") ?? "").trim(),
    variety: String(formData.get("variety") ?? "").trim() || undefined,
    sowing_date: String(formData.get("sowing_date") ?? "").trim(),
    expected_harvest_date:
      String(formData.get("expected_harvest_date") ?? "").trim() || undefined,
    harvest_date:
      String(formData.get("harvest_date") ?? "").trim() || undefined,
    quantity: formData.get("quantity"),
    unit: String(formData.get("unit") ?? "kg").trim(),
  };

  const parsed = createBatchSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  let batchCode: string;
  try {
    batchCode = await generateBatchCode(supabase);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to generate batch code" };
  }

  const { data: batch, error } = await supabase
    .from("batches")
    .insert({
      batch_code: batchCode,
      farm_id: parsed.data.farm_id,
      crop_name: parsed.data.crop_name,
      variety: parsed.data.variety ?? null,
      sowing_date: parsed.data.sowing_date,
      expected_harvest_date: parsed.data.expected_harvest_date ?? null,
      harvest_date: parsed.data.harvest_date ?? null,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      status: parsed.data.harvest_date ? "Harvested" : "Growing",
    })
    .select("id")
    .single();

  if (error || !batch) {
    return { error: error?.message ?? "Failed to create batch" };
  }

  await supabase.from("audit_logs").insert({
    batch_id: batch.id,
    action: "Batch Created",
    field_name: "batch_code",
    old_value: null,
    new_value: batchCode,
    edited_by: "Farmer",
  });

  if (parsed.data.harvest_date) {
    await supabase.from("audit_logs").insert({
      batch_id: batch.id,
      action: "Harvest Recorded",
      field_name: "harvest_date",
      old_value: null,
      new_value: parsed.data.harvest_date,
      edited_by: "Farmer",
    });
  }

  revalidatePath("/dashboard");
  redirect(`/batch/${batch.id}`);
}

export async function updateBatchAction(input: unknown): Promise<ActionResult> {
  const parsed = updateBatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { id: batchId, ...updates } = parsed.data;

  // Fetch previous state for audit log comparison
  const { data: prevBatch, error: fetchErr } = await supabase
    .from("batches")
    .select("*")
    .eq("id", batchId)
    .single();

  if (fetchErr || !prevBatch) {
    return { error: fetchErr?.message ?? "Batch not found" };
  }

  const { error: updateErr } = await supabase
    .from("batches")
    .update({
      crop_name: updates.crop_name,
      variety: updates.variety ?? null,
      sowing_date: updates.sowing_date,
      expected_harvest_date: updates.expected_harvest_date ?? null,
      harvest_date: updates.harvest_date ?? null,
      quantity: updates.quantity,
      unit: updates.unit,
      status: updates.status,
    })
    .eq("id", batchId);

  if (updateErr) {
    return { error: updateErr.message };
  }

  // Audit comparisons
  const fieldsToCheck: Array<{
    field: keyof typeof updates;
    label: string;
  }> = [
    { field: "crop_name", label: "Crop Name" },
    { field: "variety", label: "Variety" },
    { field: "sowing_date", label: "Sowing Date" },
    { field: "expected_harvest_date", label: "Expected Harvest Date" },
    { field: "harvest_date", label: "Harvest Date" },
    { field: "quantity", label: "Quantity" },
    { field: "unit", label: "Unit" },
    { field: "status", label: "Status" },
  ];

  const auditEntries = [];
  for (const { field, label } of fieldsToCheck) {
    const oldVal = prevBatch[field] != null ? String(prevBatch[field]) : null;
    const newVal = updates[field] != null ? String(updates[field]) : null;
    if (oldVal !== newVal) {
      auditEntries.push({
        batch_id: batchId,
        action: `${label} Changed`,
        field_name: field,
        old_value: oldVal,
        new_value: newVal,
        edited_by: "Farmer",
      });
    }
  }

  if (auditEntries.length > 0) {
    await supabase.from("audit_logs").insert(auditEntries);
  }

  revalidatePath(`/batch/${batchId}`);
  revalidatePath(`/trace/${prevBatch.batch_code}`);
  revalidatePath("/dashboard");

  return { success: true };
}
