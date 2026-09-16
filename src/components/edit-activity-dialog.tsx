"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Loader2, MapPin, Upload } from "lucide-react";
import { updateActivityAction } from "@/app/actions/activities";
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/constants";
import type { Activity } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function EditActivityDialog({
  activity,
  batchCode,
}: {
  activity: Activity;
  batchCode?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>(activity.activity_type);
  const [description, setDescription] = useState(activity.description ?? "");
  const [activityDate, setActivityDate] = useState(activity.activity_date);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoWarning, setPhotoWarning] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhotoWarning(null);
    setSubmitting(true);

    let photoUrl: string | null = activity.photo_url;
    if (photoFile && batchCode) {
      try {
        const supabase = createClient();
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const safeType = (activityType || "activity")
          .toLowerCase()
          .replace(/\s+/g, "-");
        const path = `${batchCode}/${safeType}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("activity-photos")
          .upload(path, photoFile, { upsert: false });
        if (uploadError) {
          setPhotoWarning(
            "Photo upload failed. The activity can still be saved.",
          );
        } else {
          const { data } = supabase.storage
            .from("activity-photos")
            .getPublicUrl(path);
          photoUrl = data.publicUrl;
        }
      } catch {
        setPhotoWarning("Photo upload failed. The activity can still be saved.");
      }
    }

    const result = await updateActivityAction({
      id: activity.id,
      batch_id: activity.batch_id,
      activity_type: activityType as ActivityType,
      description: description || null,
      activity_date: activityDate,
      latitude: activity.latitude,
      longitude: activity.longitude,
      photo_url: photoUrl,
    });

    setSubmitting(false);

    if (result.error || result.fieldErrors) {
      const msg =
        result.error ??
        Object.values(result.fieldErrors ?? {})
          .flat()
          .join(", ");
      setError(msg || "Could not update activity");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="rounded p-1 text-[#5c7364] hover:bg-[#e8f0e4] hover:text-[#1a3d2e] transition"
            title="Edit activity"
          >
            <Edit2 className="size-3.5" />
          </button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dfe8d8] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1a3d2e]">
            Edit Cultivation Activity
          </DialogTitle>
          <p className="text-xs text-[#5c7364]">
            Changes will be logged in the immutable audit history.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit_activity_type">Activity Type</Label>
            <Select
              value={activityType}
              onValueChange={(v) => v && setActivityType(v)}
            >
              <SelectTrigger id="edit_activity_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was done in the field?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_activity_date">Activity Date</Label>
            <Input
              id="edit_activity_date"
              type="date"
              required
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
            />
          </div>

          {activity.latitude != null && activity.longitude != null && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#f8fbf6] px-3 py-2 text-xs text-[#5c7364] border border-[#eef3ea]">
              <MapPin className="size-3.5 text-[#2d6a4f]" />
              <span>
                GPS: {activity.latitude.toFixed(5)}° N, {activity.longitude.toFixed(5)}° E
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit_photo" className="flex items-center gap-1.5">
              <Upload className="size-3.5" />
              Replace Photo Evidence (Optional)
            </Label>
            <Input
              id="edit_photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {photoWarning && (
            <p className="text-xs text-amber-800">{photoWarning}</p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-[#2d6a4f] hover:bg-[#24543f] text-white"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Updating Activity…
              </>
            ) : (
              "Save & Record Audit"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
