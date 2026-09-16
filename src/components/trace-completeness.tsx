"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  FileCheck,
  MapPin,
  Image,
  Sprout,
  Calendar,
  Building,
  ShieldCheck,
} from "lucide-react";
import type { Activity, Batch, Farm, Verification } from "@/lib/database.types";
import { cn } from "@/lib/utils";

interface TraceCompletenessProps {
  batch: Batch;
  farm: Farm | null;
  activities: Activity[];
  verification: Verification | null;
}

export type CompletenessItem = {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  icon: React.ElementType;
};

export function calculateCompleteness(
  batch: Batch,
  farm: Farm | null,
  activities: Activity[],
  verification: Verification | null,
): { percentage: number; items: CompletenessItem[] } {
  const hasFarmInfo = Boolean(farm?.farm_name && (farm?.village || farm?.state));
  const hasCropInfo = Boolean(batch.crop_name && batch.quantity > 0);
  const hasSowing = Boolean(batch.sowing_date);
  const hasCultivation = activities.length > 0;
  const hasGps = Boolean(
    (farm?.latitude != null && farm?.longitude != null) ||
      activities.some((a) => a.latitude != null && a.longitude != null),
  );
  const hasPhoto = activities.some((a) => Boolean(a.photo_url));
  const hasHarvest = Boolean(
    batch.harvest_date ||
      activities.some(
        (a) => a.activity_type.toLowerCase() === "harvest" || batch.status === "Harvested",
      ),
  );
  const hasVerification = verification?.status === "VERIFIED";

  const items: CompletenessItem[] = [
    {
      id: "farm",
      label: "Farm Information",
      description: farm?.farm_name ? `${farm.farm_name}, ${farm.village || ""}` : "Farm origin recorded",
      isComplete: hasFarmInfo,
      icon: Building,
    },
    {
      id: "crop",
      label: "Crop Information",
      description: `${batch.crop_name}${batch.variety ? ` (${batch.variety})` : ""}`,
      isComplete: hasCropInfo,
      icon: Sprout,
    },
    {
      id: "sowing",
      label: "Sowing Record",
      description: "Sowing date and batch setup documented",
      isComplete: hasSowing,
      icon: Calendar,
    },
    {
      id: "cultivation",
      label: "Cultivation Records",
      description: `${activities.length} field activities logged`,
      isComplete: hasCultivation,
      icon: FileCheck,
    },
    {
      id: "gps",
      label: "GPS Evidence",
      description: hasGps ? "Geo-tagged field / activity coordinates" : "Geo-coordinates missing",
      isComplete: hasGps,
      icon: MapPin,
    },
    {
      id: "photo",
      label: "Photo Evidence",
      description: hasPhoto ? "Photographic field evidence uploaded" : "No photos uploaded yet",
      isComplete: hasPhoto,
      icon: Image,
    },
    {
      id: "harvest",
      label: "Harvest Record",
      description: hasHarvest ? "Harvest completed and logged" : "Pending harvest",
      isComplete: hasHarvest,
      icon: Sprout,
    },
    {
      id: "verification",
      label: "Cooperative Verification",
      description: hasVerification
        ? `Verified by ${verification?.organization || "Cooperative"}`
        : "Pending cooperative audit",
      isComplete: hasVerification,
      icon: ShieldCheck,
    },
  ];

  const completedCount = items.filter((item) => item.isComplete).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return { percentage, items };
}

export function TraceCompleteness({
  batch,
  farm,
  activities,
  verification,
}: TraceCompletenessProps) {
  const [expanded, setExpanded] = useState(false);
  const { percentage, items } = calculateCompleteness(
    batch,
    farm,
    activities,
    verification,
  );

  const completedCount = items.filter((i) => i.isComplete).length;

  return (
    <div className="rounded-2xl border border-[#dfe8d8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5c7364]">
            Traceability Completeness
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1a3d2e]">{percentage}%</span>
            <span className="text-xs text-[#5c7364]">
              ({completedCount} of {items.length} verification pillars)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-[#2d6a4f] hover:underline"
        >
          {expanded ? "Hide checklist" : "View checklist"}
          <ChevronDown
            className={cn("size-3.5 transition", expanded && "rotate-180")}
          />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#e8f0e4]">
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            percentage >= 80
              ? "bg-[#2d6a4f]"
              : percentage >= 50
              ? "bg-[#52b788]"
              : "bg-amber-500",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Expandable Checklist */}
      {expanded && (
        <div className="mt-4 grid gap-2.5 border-t border-[#eef3ea] pt-4 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition",
                  item.isComplete
                    ? "border-[#dfe8d8] bg-[#f8fbf6]"
                    : "border-gray-200 bg-gray-50/70 opacity-70",
                )}
              >
                {item.isComplete ? (
                  <CheckCircle2 className="size-4 shrink-0 text-[#2d6a4f] mt-0.5" />
                ) : (
                  <Circle className="size-4 shrink-0 text-gray-400 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-medium text-[#1a3d2e]">
                    <Icon className="size-3 text-[#5c7364]" />
                    <span>{item.label}</span>
                  </div>
                  <p className="truncate text-[#5c7364]">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
