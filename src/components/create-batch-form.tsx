"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import {
  createBatchAction,
  type ActionResult,
} from "@/app/actions/batches";
import { BATCH_UNITS, CROP_MASTER } from "@/lib/constants";
import type { Farm } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionResult = {};

export function CreateBatchForm({ farms }: { farms: Farm[] }) {
  const [state, formAction, pending] = useActionState(createBatchAction, initial);
  const defaultFarmId = farms[0]?.id ?? "";
  const [farmId, setFarmId] = useState<string>(defaultFarmId);
  const [cropName, setCropName] = useState<string>("Tomato");
  const [unit, setUnit] = useState<string>("kg");

  const selectedFarmId = farmId || defaultFarmId;

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="farm_id">Farm</Label>
        <select
          id="farm_id"
          name="farm_id"
          value={selectedFarmId}
          onChange={(e) => setFarmId(e.target.value)}
          required
          className="flex h-9 w-full rounded-lg border border-[#c5d9c8] bg-white px-3 py-1.5 text-sm text-[#1a3d2e] shadow-sm transition focus:border-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20"
        >
          {farms.length === 0 && (
            <option value="" disabled>
              No farms available
            </option>
          )}
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.farm_name}
              {farm.village || farm.district
                ? ` · ${[farm.village, farm.district].filter(Boolean).join(", ")}`
                : ""}
            </option>
          ))}
        </select>
        {state.fieldErrors?.farm_id && (
          <p className="text-sm text-destructive">{state.fieldErrors.farm_id[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="crop_name">Crop</Label>
          <select
            id="crop_name"
            name="crop_name"
            value={cropName}
            onChange={(e) => {
              const selectedCrop = e.target.value;
              setCropName(selectedCrop);
              const cropInfo = CROP_MASTER.find((c) => c.name === selectedCrop);
              if (cropInfo) {
                setUnit(cropInfo.unit);
              }
            }}
            required
            className="flex h-9 w-full rounded-lg border border-[#c5d9c8] bg-white px-3 py-1.5 text-sm text-[#1a3d2e] shadow-sm transition focus:border-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20"
          >
            {CROP_MASTER.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.category})
              </option>
            ))}
          </select>
          {state.fieldErrors?.crop_name && (
            <p className="text-sm text-destructive">{state.fieldErrors.crop_name[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="variety">Variety</Label>
          <Input
            id="variety"
            name="variety"
            placeholder="e.g. Anagha"
            className="border-[#c5d9c8]"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sowing_date">Sowing date</Label>
          <Input
            id="sowing_date"
            name="sowing_date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="border-[#c5d9c8]"
          />
          {state.fieldErrors?.sowing_date && (
            <p className="text-sm text-destructive">{state.fieldErrors.sowing_date[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_harvest_date">Expected harvest</Label>
          <Input
            id="expected_harvest_date"
            name="expected_harvest_date"
            type="date"
            className="border-[#c5d9c8]"
          />
          {state.fieldErrors?.expected_harvest_date && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.expected_harvest_date[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="harvest_date">Actual harvest (if done)</Label>
          <Input
            id="harvest_date"
            name="harvest_date"
            type="date"
            className="border-[#c5d9c8]"
          />
          {state.fieldErrors?.harvest_date && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.harvest_date[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0.01"
            step="any"
            required
            placeholder="100"
            defaultValue="100"
            className="border-[#c5d9c8]"
          />
          {state.fieldErrors?.quantity && (
            <p className="text-sm text-destructive">{state.fieldErrors.quantity[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <select
            id="unit"
            name="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-[#c5d9c8] bg-white px-3 py-1.5 text-sm text-[#1a3d2e] shadow-sm transition focus:border-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20"
          >
            {BATCH_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button
        type="submit"
        className="w-full bg-[#2d6a4f] hover:bg-[#24543f] text-white sm:w-auto"
        disabled={pending || !selectedFarmId || !cropName}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Creating batch…
          </>
        ) : (
          "Create batch"
        )}
      </Button>
    </form>
  );
}
