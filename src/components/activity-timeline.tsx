"use client";

import { format } from "date-fns";
import {
  ChevronDown,
  Droplets,
  Eye,
  Flower2,
  MapPin,
  Package,
  Scissors,
  Shield,
  Sparkles,
  Sprout,
  Truck,
} from "lucide-react";
import { useState } from "react";
import type { Activity } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EditActivityDialog } from "@/components/edit-activity-dialog";

function ActivityIcon({ type, className }: { type: string; className?: string }) {
  const lower = type.toLowerCase();
  if (lower.includes("sow")) return <Sprout className={className} />;
  if (lower.includes("fertiliz")) return <Sparkles className={className} />;
  if (lower.includes("irrigat") || lower.includes("water")) return <Droplets className={className} />;
  if (lower.includes("pest")) return <Shield className={className} />;
  if (lower.includes("weed")) return <Scissors className={className} />;
  if (lower.includes("harvest")) return <Flower2 className={className} />;
  if (lower.includes("pack")) return <Package className={className} />;
  if (lower.includes("transport")) return <Truck className={className} />;
  return <Sprout className={className} />;
}

export function ActivityTimeline({
  activities,
  canEdit = false,
  batchCode,
}: {
  activities: Activity[];
  canEdit?: boolean;
  batchCode?: string;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    title: string;
    date: string;
  } | null>(null);

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#dfe8d8] bg-white/70 px-6 py-10 text-center">
        <Sprout className="mx-auto size-8 text-[#5c7364]/60" />
        <p className="mt-2 text-sm font-medium text-[#1a3d2e]">
          No activities recorded yet
        </p>
        <p className="mt-1 text-xs text-[#5c7364]">
          Cultivation events and evidence photographs will appear here in chronological order.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative space-y-0">
        <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#2d6a4f] via-[#52b788] to-[#c5d9c8]" />
        {activities.map((activity, index) => (
          <TimelineItem
            key={activity.id}
            activity={activity}
            isLast={index === activities.length - 1}
            canEdit={canEdit}
            batchCode={batchCode}
            onOpenPhoto={(photo) => setSelectedPhoto(photo)}
          />
        ))}
      </div>

      {/* Photo Lightbox Dialog */}
      <Dialog
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-2xl border-[#dfe8d8] bg-black/95 p-2 text-white sm:rounded-2xl overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedPhoto?.title ?? "Activity Evidence"}
          </DialogTitle>
          <div className="relative flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto?.url}
              alt={selectedPhoto?.title ?? "Evidence"}
              className="max-h-[75vh] w-auto rounded-lg object-contain"
            />
            <div className="mt-3 flex w-full items-center justify-between px-3 pb-1 text-xs text-white/80">
              <span className="font-semibold text-white">
                {selectedPhoto?.title}
              </span>
              <span>{selectedPhoto?.date}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TimelineItem({
  activity,
  isLast,
  canEdit = false,
  batchCode,
  onOpenPhoto,
}: {
  activity: Activity;
  isLast: boolean;
  canEdit?: boolean;
  batchCode?: string;
  onOpenPhoto: (photo: { url: string; title: string; date: string }) => void;
}) {
  const [open, setOpen] = useState(true);

  const hasEvidence =
    activity.description ||
    activity.latitude != null ||
    activity.photo_url;

  const formattedDate = format(new Date(activity.activity_date), "d MMMM yyyy");

  return (
    <div className={cn("relative pl-10 pb-6", isLast && "pb-0")}>
      {/* Timeline Node Pin */}
      <span
        className={cn(
          "absolute left-1 top-1.5 flex size-7 items-center justify-center rounded-full border-2 border-[#2d6a4f] bg-white text-[#2d6a4f] shadow-sm",
          isLast && "bg-[#2d6a4f] text-white ring-4 ring-[#2d6a4f]/20",
        )}
      >
        <ActivityIcon type={activity.activity_type} className="size-3.5" />
      </span>

      <div className="overflow-hidden rounded-2xl border border-[#dfe8d8] bg-white shadow-sm transition hover:border-[#2d6a4f]/40">
        <div className="flex items-start justify-between gap-3 p-4 bg-[#f8fbf6]/50">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[#1a3d2e]">
                {activity.activity_type}
              </h3>
              {activity.photo_url && (
                <span className="inline-flex items-center rounded-md bg-[#e8f0e4] px-1.5 py-0.5 text-[10px] font-medium text-[#2d6a4f]">
                  Photo Attached
                </span>
              )}
              {activity.latitude != null && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-[#e8f0e4] px-1.5 py-0.5 text-[10px] font-medium text-[#2d6a4f]">
                  <MapPin className="size-2.5" /> GPS Tagged
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[#5c7364]">
              {formattedDate}
              <span className="text-[#8fa396]">
                {" · "}
                {format(new Date(activity.created_at), "h:mm a")}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1">
            {canEdit && (
              <EditActivityDialog activity={activity} batchCode={batchCode} />
            )}
            {hasEvidence && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="rounded-lg p-1.5 text-[#5c7364] hover:bg-[#e8f0e4] transition"
                aria-expanded={open}
                title="Toggle details"
              >
                <ChevronDown
                  className={cn("size-4 transition-transform", open && "rotate-180")}
                />
              </button>
            )}
          </div>
        </div>

        {open && hasEvidence && (
          <div className="space-y-3 border-t border-[#eef3ea] p-4 text-xs">
            {activity.description && (
              <p className="text-[#3d5a45] leading-relaxed text-sm">
                {activity.description}
              </p>
            )}

            {activity.latitude != null && activity.longitude != null && (
              <div className="flex items-center gap-1.5 rounded-lg bg-[#f8fbf6] px-2.5 py-1.5 text-[#5c7364] border border-[#eef3ea] font-mono text-[11px]">
                <MapPin className="size-3.5 shrink-0 text-[#2d6a4f]" />
                <span>
                  GPS: {activity.latitude.toFixed(5)}° N, {activity.longitude.toFixed(5)}° E
                </span>
              </div>
            )}

            {activity.photo_url && (
              <div className="relative group overflow-hidden rounded-xl border border-[#dfe8d8] bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activity.photo_url}
                  alt={`${activity.activity_type} evidence`}
                  className="max-h-56 w-full object-cover cursor-pointer transition duration-300 group-hover:scale-105"
                  onClick={() =>
                    onOpenPhoto({
                      url: activity.photo_url!,
                      title: `${activity.activity_type} Photo Evidence`,
                      date: formattedDate,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    onOpenPhoto({
                      url: activity.photo_url!,
                      title: `${activity.activity_type} Photo Evidence`,
                      date: formattedDate,
                    })
                  }
                  className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm opacity-90 transition hover:bg-black"
                >
                  <Eye className="size-3" /> Full View
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
