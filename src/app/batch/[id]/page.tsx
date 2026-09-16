import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { ActivityTimeline } from "@/components/activity-timeline";
import { AddActivityDialog } from "@/components/add-activity-dialog";
import { AuditHistory } from "@/components/audit-history";
import { BatchQrCard } from "@/components/batch-qr-card";
import { EditBatchDialog } from "@/components/edit-batch-dialog";
import { FarmMap } from "@/components/farm-map";
import {
  isSupabaseConfigured,
  SupabaseSetupBanner,
} from "@/components/supabase-setup-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBatchById } from "@/lib/queries/batches";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <AppShell>
        <SupabaseSetupBanner />
      </AppShell>
    );
  }

  const { batch, error } = await getBatchById(id);

  if (error) {
    return (
      <AppShell>
        <p className="text-destructive">{error}</p>
      </AppShell>
    );
  }

  if (!batch) {
    notFound();
  }

  const farm = batch.farms;
  const verification = batch.verifications?.[0];
  const locationLabel = [farm?.village, farm?.state].filter(Boolean).join(", ");

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm text-[#5c7364] hover:text-[#2d6a4f]">
          ← Dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold capitalize text-[#1a3d2e]">
              {batch.crop_name}
            </h1>
            <Badge className="bg-[#e8f0e4] text-[#2d6a4f]">{batch.status}</Badge>
            {verification?.status === "VERIFIED" && (
              <Badge className="bg-[#2d6a4f] text-white">✓ Verified</Badge>
            )}
          </div>
          <p className="font-mono text-sm text-[#5c7364]">{batch.batch_code}</p>
          {batch.variety && (
            <p className="text-sm text-[#5c7364]">Variety: {batch.variety}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EditBatchDialog batch={batch} />
          <AddActivityDialog
            batchId={batch.id}
            batchCode={batch.batch_code}
            cropName={batch.crop_name}
            variety={batch.variety}
          />
        </div>
      </div>

      {/* QR Code Section */}
      <div className="mt-6">
        <BatchQrCard
          batchCode={batch.batch_code}
          cropName={batch.crop_name}
          variety={batch.variety}
          farmName={farm?.farm_name}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="border-[#dfe8d8] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#5c7364]">Farm</CardTitle>
          </CardHeader>
          <CardContent className="text-[#1a3d2e]">
            <p className="font-semibold">{farm?.farm_name ?? "—"}</p>
            <p className="text-sm text-[#5c7364]">{locationLabel || "—"}</p>
            {farm?.latitude != null && farm?.longitude != null && (
              <p className="mt-2 text-xs text-[#8fa396]">
                {farm.latitude.toFixed(4)}° N, {farm.longitude.toFixed(4)}° E
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-[#dfe8d8] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#5c7364]">Batch details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-[#3d5a45]">
            <p>
              Sown: {format(new Date(batch.sowing_date), "d MMM yyyy")}
            </p>
            {batch.expected_harvest_date && (
              <p>
                Expected harvest:{" "}
                {format(new Date(batch.expected_harvest_date), "d MMM yyyy")}
              </p>
            )}
            {batch.harvest_date && (
              <p>Harvested: {format(new Date(batch.harvest_date), "d MMM yyyy")}</p>
            )}
            <p>
              Quantity: {batch.quantity} {batch.unit}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <section className="mt-8">
        <FarmMap farm={farm} activities={batch.activities ?? []} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#5c7364]">
            Cultivation journey
          </h2>
          <span className="text-xs text-[#8fa396]">
            {batch.activities?.length ?? 0} activities recorded
          </span>
        </div>
        <ActivityTimeline
          activities={batch.activities ?? []}
          canEdit={true}
          batchCode={batch.batch_code}
        />
      </section>

      {verification && (
        <section className="mt-10">
          <Card className="border-[#c5d9c8] bg-[#f8fbf6]">
            <CardHeader>
              <CardTitle className="text-[#1a3d2e]">Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#3d5a45]">
              <p className="font-medium">{verification.organization}</p>
              <p>Status: {verification.status}</p>
              {verification.verified_at && (
                <p>
                  Verified:{" "}
                  {format(new Date(verification.verified_at), "d MMMM yyyy")}
                </p>
              )}
              {verification.remarks && (
                <p className="mt-2 text-[#5c7364]">{verification.remarks}</p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Comprehensive Audit & Integrity History */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5c7364]">
          Audit history
        </h2>
        <AuditHistory auditLogs={batch.audit_logs ?? []} />
      </section>

      <Separator className="my-8 bg-[#dfe8d8]" />
      <p className="text-center text-xs text-[#8fa396]">
        AgriTrace batch <span className="font-mono font-semibold">{batch.batch_code}</span> ·
        Ready for consumer scanning and verification
      </p>
    </AppShell>
  );
}
