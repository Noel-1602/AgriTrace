"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Loader2 } from "lucide-react";
import { updateBatchAction } from "@/app/actions/batches";
import { BATCH_STATUSES, BATCH_UNITS } from "@/lib/constants";
import type { Batch } from "@/lib/database.types";
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

export function EditBatchDialog({ batch }: { batch: Batch }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cropName, setCropName] = useState(batch.crop_name);
  const [variety, setVariety] = useState(batch.variety ?? "");
  const [sowingDate, setSowingDate] = useState(batch.sowing_date);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    batch.expected_harvest_date ?? "",
  );
  const [harvestDate, setHarvestDate] = useState(batch.harvest_date ?? "");
  const [quantity, setQuantity] = useState(String(batch.quantity));
  const [unit, setUnit] = useState(batch.unit);
  const [status, setStatus] = useState<Batch["status"]>(batch.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await updateBatchAction({
      id: batch.id,
      crop_name: cropName,
      variety: variety || null,
      sowing_date: sowingDate,
      expected_harvest_date: expectedHarvestDate || null,
      harvest_date: harvestDate || null,
      quantity: Number(quantity),
      unit,
      status,
    });

    setSubmitting(false);

    if (result.error || result.fieldErrors) {
      const msg =
        result.error ??
        Object.values(result.fieldErrors ?? {})
          .flat()
          .join(", ");
      setError(msg || "Could not update batch");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="border-[#c5d9c8] text-[#1a3d2e] hover:bg-[#f4f7f2]"
          >
            <Edit3 className="size-3.5 mr-1 text-[#2d6a4f]" />
            Edit Batch
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dfe8d8] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1a3d2e]">
            Edit Batch Details
          </DialogTitle>
          <p className="font-mono text-xs text-[#5c7364]">{batch.batch_code}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="crop_name">Crop Name</Label>
            <Input
              id="crop_name"
              required
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variety">Variety (Optional)</Label>
            <Input
              id="variety"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                min="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={(v) => v && setUnit(v as typeof batch.unit)}>
                <SelectTrigger id="unit">
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

          <div className="space-y-2">
            <Label htmlFor="status">Batch Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as typeof batch.status)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BATCH_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sowing_date">Sowing Date</Label>
            <Input
              id="sowing_date"
              type="date"
              required
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expected_harvest_date">Expected Harvest</Label>
              <Input
                id="expected_harvest_date"
                type="date"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvest_date">Actual Harvest</Label>
              <Input
                id="harvest_date"
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-[#2d6a4f] hover:bg-[#24543f] text-white"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Updating Batch…
              </>
            ) : (
              "Save Changes & Record Audit"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
