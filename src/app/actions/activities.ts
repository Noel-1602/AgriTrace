"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createActivitySchema, updateActivitySchema } from "@/lib/validation";

export type ActivityActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createActivityAction(
  input: unknown,
): Promise<ActivityActionResult> {
  const parsed = createActivitySchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { batch_id, activity_type, ...rest } = parsed.data;

  const { error } = await supabase.from("activities").insert({
    batch_id,
    activity_type,
    description: rest.description ?? null,
    activity_date: rest.activity_date,
    latitude: rest.latitude ?? null,
    longitude: rest.longitude ?? null,
    photo_url: rest.photo_url ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  if (activity_type === "Harvest") {
    await supabase
      .from("batches")
      .update({
        status: "Harvested",
        harvest_date: rest.activity_date,
      })
      .eq("id", batch_id);

    await supabase.from("audit_logs").insert({
      batch_id,
      action: "Harvest Recorded",
      field_name: "status",
      old_value: "Growing",
      new_value: "Harvested",
      edited_by: "Farmer",
    });
  }

  await supabase.from("audit_logs").insert({
    batch_id,
    action: "Activity Added",
    field_name: "activity_type",
    old_value: null,
    new_value: activity_type,
    edited_by: "Farmer",
  });

  revalidatePath(`/batch/${batch_id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateActivityAction(
  input: unknown,
): Promise<ActivityActionResult> {
  const parsed = updateActivitySchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { id: activityId, batch_id: batchId, ...updates } = parsed.data;

  const { data: prevActivity, error: fetchErr } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (fetchErr || !prevActivity) {
    return { error: fetchErr?.message ?? "Activity not found" };
  }

  const { error: updateErr } = await supabase
    .from("activities")
    .update({
      activity_type: updates.activity_type,
      description: updates.description ?? null,
      activity_date: updates.activity_date,
      latitude: updates.latitude ?? null,
      longitude: updates.longitude ?? null,
      photo_url: updates.photo_url ?? null,
    })
    .eq("id", activityId);

  if (updateErr) {
    return { error: updateErr.message };
  }

  // Audit logging for modified activity fields
  const fieldsToCheck: Array<{
    field: keyof typeof updates;
    label: string;
  }> = [
    { field: "activity_type", label: "Activity Type" },
    { field: "description", label: "Activity Description" },
    { field: "activity_date", label: "Activity Date" },
    { field: "latitude", label: "Activity Latitude" },
    { field: "longitude", label: "Activity Longitude" },
    { field: "photo_url", label: "Activity Photo" },
  ];

  const auditEntries = [];
  for (const { field, label } of fieldsToCheck) {
    const oldVal =
      prevActivity[field] != null ? String(prevActivity[field]) : null;
    const newVal =
      updates[field] != null ? String(updates[field]) : null;
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
  revalidatePath("/dashboard");
  return { success: true };
}
