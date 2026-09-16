"use client";

import { Loader2, MapPin, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createActivityAction } from "@/app/actions/activities";
import { ACTIVITY_TYPES } from "@/lib/constants";
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

type GpsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number; accuracy?: number }
  | { status: "denied" };

export function AddActivityDialog({
  batchId,
  batchCode,
  cropName,
  variety,
}: {
  batchId: string;
  batchCode: string;
  cropName: string;
  variety: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [activityDate, setActivityDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [gps, setGps] = useState<GpsState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoWarning, setPhotoWarning] = useState<string | null>(null);

  const captureGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGps({ status: "denied" });
      return;
    }
    setGps({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          status: "ok",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => setGps({ status: "denied" }),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhotoWarning(null);
    setSubmitting(true);

    let photoUrl: string | null = null;
    if (photoFile) {
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

    const result = await createActivityAction({
      batch_id: batchId,
      activity_type: activityType,
      description: description || undefined,
      activity_date: activityDate,
      latitude: gps.status === "ok" ? gps.lat : null,
      longitude: gps.status === "ok" ? gps.lng : null,
      photo_url: photoUrl,
    });

    setSubmitting(false);

    if (result.error || result.fieldErrors) {
      const msg =
        result.error ??
        Object.values(result.fieldErrors ?? {})
          .flat()
          .join(", ");
      setError(msg || "Could not save activity");
      return;
    }

    setOpen(false);
    setActivityType("");
    setDescription("");
    setPhotoFile(null);
    setGps({ status: "idle" });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-[#2d6a4f] hover:bg-[#24543f]">
            + Add Activity
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dfe8d8] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1a3d2e]">Record activity</DialogTitle>
          <p className="text-sm text-[#5c7364]">
            {cropName}
            {variety ? ` · ${variety}` : ""}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity_type">Activity type</Label>
            <Select
              value={activityType}
              onValueChange={(v) => v && setActivityType(v)}
              required
            >
              <SelectTrigger id="activity_type" className="w-full">
                <SelectValue placeholder="Select activity" />
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was done in the field?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_date">Activity date</Label>
            <Input
              id="activity_date"
              type="date"
              required
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-[#dfe8d8] bg-[#f8fbf6] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#2d6a4f]" />
                GPS evidence
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={captureGps}
                disabled={gps.status === "loading"}
              >
                {gps.status === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Capture location"
                )}
              </Button>
            </div>
            {gps.status === "ok" && (
              <p className="text-xs text-[#3d5a45]">
                {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                {gps.accuracy != null && ` (±${Math.round(gps.accuracy)}m)`}
              </p>
            )}
            {gps.status === "denied" && (
              <p className="text-xs text-amber-800">
                Location unavailable. You can continue without GPS evidence.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center gap-1.5">
              <Upload className="size-3.5" />
              Photo (optional)
            </Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {photoWarning && (
            <p className="text-sm text-amber-800">{photoWarning}</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-[#2d6a4f] hover:bg-[#24543f]"
            disabled={submitting || !activityType}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save activity"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
