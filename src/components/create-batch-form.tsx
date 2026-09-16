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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initial: ActionResult = {};

export function CreateBatchForm({ farms }: { farms: Farm[] }) {
  const [state, formAction, pending] = useActionState(createBatchAction, initial);
  const [farmId, setFarmId] = useState("");
  const [cropName, setCropName] = useState("");
  const [unit, setUnit] = useState<string>("kg");

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="farm_id" value={farmId} />
      <input type="hidden" name="crop_name" value={cropName} />
      <input type="hidden" name="unit" value={unit} />

      <div className="space-y-2">
        <Label htmlFor="farm_id">Farm</Label>
        <Select value={farmId} onValueChange={(v) => v && setFarmId(v)} required>
          <SelectTrigger id="farm_id" className="w-full">
            <SelectValue placeholder="Select farm" />
          </SelectTrigger>
          <SelectContent>
            {farms.map((farm) => (
              <SelectItem key={farm.id} value={farm.id}>
                {farm.farm_name}
                {farm.district ? ` · ${farm.district}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.farm_id && (
          <p className="text-sm text-destructive">{state.fieldErrors.farm_id[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="crop_name">Crop</Label>
          <Select value={cropName} onValueChange={(v) => v && setCropName(v)} required>
            <SelectTrigger id="crop_name" className="w-full">
              <SelectValue placeholder="Select crop" />
            </SelectTrigger>
            <SelectContent>
              {CROP_MASTER.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors?.crop_name && (
            <p className="text-sm text-destructive">{state.fieldErrors.crop_name[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="variety">Variety</Label>
          <Input id="variety" name="variety" placeholder="e.g. Anagha" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sowing_date">Sowing date</Label>
          <Input id="sowing_date" name="sowing_date" type="date" required />
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
          />
          {state.fieldErrors?.quantity && (
            <p className="text-sm text-destructive">{state.fieldErrors.quantity[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Select value={unit} onValueChange={(v) => v && setUnit(v)}>
            <SelectTrigger id="unit" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BATCH_UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button
        type="submit"
        className="w-full bg-[#2d6a4f] hover:bg-[#24543f] sm:w-auto"
        disabled={pending || farms.length === 0 || !farmId || !cropName}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating batch…
          </>
        ) : (
          "Create batch"
        )}
      </Button>
    </form>
  );
}
