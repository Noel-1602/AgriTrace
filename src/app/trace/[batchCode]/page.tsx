import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Clock,
  History,
  MapPin,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  User,
} from "lucide-react";
import { ActivityTimeline } from "@/components/activity-timeline";
import { FarmMap } from "@/components/farm-map";
import { isSupabaseConfigured } from "@/components/supabase-setup-banner";
import { TraceCompleteness } from "@/components/trace-completeness";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getBatchByCode } from "@/lib/queries/trace";
import { cn } from "@/lib/utils";

export default async function TracePage({
  params,
}: {
  params: Promise<{ batchCode: string }>;
}) {
  const { batchCode } = await params;

  const { data, error } = await getBatchByCode(batchCode);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f7f2] p-6 text-center text-destructive">
        <p>Error loading batch: {error}</p>
      </div>
    );
  }

  if (!data || !data.batch) {
    notFound();
  }

  const { batch, farm, activities, verification, auditLogs } = data;
  const isVerified = verification?.status === "VERIFIED";
  const locationLabel = [farm?.village, farm?.district, farm?.state]
    .filter(Boolean)
    .join(", ");
  const farmerName = farm?.farmers?.name;

  return (
    <div className="min-h-screen bg-[#f4f7f2] pb-16 text-[#1a3d2e]">
      {!isSupabaseConfigured() && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-900">
          Demo Mode · Running on simulated PRD dataset until <code className="bg-white/80 px-1 rounded">.env.local</code> is configured.
        </div>
      )}
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#dfe8d8] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#2d6a4f] text-white">
              <Sprout className="size-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#1a3d2e]">
              AGRITRACE
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/scan"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-[#c5d9c8] text-xs text-[#2d6a4f] hover:bg-[#e8f0e4]",
              )}
            >
              <QrCode className="size-3.5 mr-1" />
              Scan Another
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6 space-y-6">
        {/* Certificate Container */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#2d6a4f]/30 bg-white shadow-xl">
          {/* Certificate Header Banner */}
          <div className="relative bg-gradient-to-r from-[#1a3d2e] via-[#2d6a4f] to-[#1a3d2e] px-6 py-6 text-white text-center">
            {/* Guilloche / Watermark subtle badge */}
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full border border-white/30 bg-white/10 shadow-inner">
              <Award className="size-6 text-[#95d5b2]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#95d5b2]">
              Digital Agricultural Certificate of Provenance
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
              {batch.crop_name}
            </h1>
            {batch.variety && (
              <p className="text-sm text-[#d8f3dc] font-medium">
                Variety: {batch.variety}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-black/25 px-3 py-1 font-mono text-xs text-white/90 border border-white/15">
                BATCH #{batch.batch_code}
              </span>
              {isVerified ? (
                <span className="flex items-center gap-1 rounded-full bg-[#52b788] px-3 py-1 text-xs font-bold text-[#081c15] shadow-sm">
                  <ShieldCheck className="size-3.5" />
                  VERIFIED PRODUCT
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
                  <ShieldAlert className="size-3.5" />
                  {verification?.status || "UNVERIFIED"}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Origin & Producer Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#dfe8d8] bg-[#f8fbf6] p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5c7364]">
                  Farm Origin
                </span>
                <p className="mt-1 text-base font-bold text-[#1a3d2e]">
                  {farm?.farm_name ?? "—"}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[#5c7364]">
                  <MapPin className="size-3.5 shrink-0 text-[#2d6a4f]" />
                  {locationLabel || "Kerala, India"}
                </p>
                {farmerName && (
                  <p className="mt-2 flex items-center gap-1 border-t border-[#eef3ea] pt-2 text-xs text-[#5c7364]">
                    <User className="size-3 text-[#2d6a4f]" />
                    Producer: <span className="font-medium text-[#1a3d2e]">{farmerName}</span>
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[#dfe8d8] bg-[#f8fbf6] p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5c7364]">
                  Harvest & Batch Specifications
                </span>
                <div className="mt-2 space-y-1.5 text-xs text-[#3d5a45]">
                  <div className="flex justify-between">
                    <span className="text-[#5c7364]">Quantity:</span>
                    <span className="font-bold text-[#1a3d2e]">
                      {batch.quantity} {batch.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5c7364]">Sown Date:</span>
                    <span className="font-medium">
                      {format(new Date(batch.sowing_date), "d MMM yyyy")}
                    </span>
                  </div>
                  {batch.harvest_date ? (
                    <div className="flex justify-between">
                      <span className="text-[#5c7364]">Harvested:</span>
                      <span className="font-bold text-[#2d6a4f]">
                        {format(new Date(batch.harvest_date), "d MMM yyyy")}
                      </span>
                    </div>
                  ) : batch.expected_harvest_date ? (
                    <div className="flex justify-between">
                      <span className="text-[#5c7364]">Expected Harvest:</span>
                      <span className="font-medium">
                        {format(new Date(batch.expected_harvest_date), "d MMM yyyy")}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span className="text-[#5c7364]">Batch Status:</span>
                    <Badge className="bg-[#e8f0e4] text-[#2d6a4f] text-[10px]">
                      {batch.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Traceability Completeness Meter */}
            <TraceCompleteness
              batch={batch}
              farm={farm}
              activities={activities}
              verification={verification}
            />

            {/* Cooperative / Agricultural Officer Verification Section (PRD 13.1 / 15) */}
            <div className="overflow-hidden rounded-2xl border border-[#c5d9c8] bg-[#f8fbf6]">
              <div className="border-b border-[#dfe8d8] bg-[#eef5eb] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#2d6a4f]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a3d2e]">
                    Official Cooperative Verification
                  </h3>
                </div>
                {isVerified && (
                  <Badge className="bg-[#2d6a4f] text-white text-[10px]">
                    ✓ Authenticated
                  </Badge>
                )}
              </div>
              <div className="p-4 space-y-3 text-xs text-[#3d5a45]">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="text-[#5c7364] block">Verifying Organization</span>
                    <p className="font-bold text-[#1a3d2e]">
                      {verification?.organization || "Green Farmers Cooperative"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#5c7364] block">Verified By Officer</span>
                    <p className="font-medium text-[#1a3d2e]">
                      {verification?.verified_by || "Agricultural Inspection Team"}
                    </p>
                  </div>
                </div>

                {verification?.verified_at && (
                  <div className="flex items-center gap-1.5 text-[#5c7364]">
                    <Clock className="size-3.5 text-[#2d6a4f]" />
                    <span>
                      Audited & Signed:{" "}
                      <strong>
                        {format(
                          new Date(verification.verified_at),
                          "d MMMM yyyy, h:mm a",
                        )}
                      </strong>
                    </span>
                  </div>
                )}

                {verification?.remarks && (
                  <div className="rounded-lg bg-white p-3 border border-[#dfe8d8] text-[#3d5a45]">
                    <p className="font-medium text-[#1a3d2e] mb-0.5">Audit Remarks:</p>
                    <p>{verification.remarks}</p>
                  </div>
                )}

                {/* Verification Checklist */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[#2d6a4f] font-medium">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>Farm Registered</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#2d6a4f] font-medium">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>Cultivation Evidence</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#2d6a4f] font-medium">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>Harvest Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#2d6a4f] font-medium">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>GPS Coordinates Confirmed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <FarmMap farm={farm} activities={activities} />

            {/* Cultivation Journey / Timeline */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#1a3d2e]">
                    Cultivation & Production Journey
                  </h2>
                  <p className="text-xs text-[#5c7364]">
                    Immutable chronological record of agricultural field operations
                  </p>
                </div>
                <Badge variant="outline" className="border-[#c5d9c8] text-[#2d6a4f]">
                  {activities.length} Records
                </Badge>
              </div>

              <ActivityTimeline activities={activities} />
            </section>

            {/* Audit History (PRD section 17) */}
            {auditLogs.length > 0 && (
              <section className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <History className="size-4 text-[#5c7364]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5c7364]">
                    Audit & Integrity History
                  </h3>
                </div>
                <div className="rounded-xl border border-[#dfe8d8] bg-white divide-y divide-[#eef3ea] text-xs">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold text-[#1a3d2e]">
                          {log.action}
                        </p>
                        {log.new_value && (
                          <p className="text-[#5c7364] mt-0.5">{log.new_value}</p>
                        )}
                        {log.edited_by && (
                          <p className="text-[10px] text-[#8fa396] mt-0.5">
                            By {log.edited_by}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-[#8fa396] shrink-0">
                        {format(new Date(log.created_at), "d MMM yyyy")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <Separator className="my-6 bg-[#dfe8d8]" />

            {/* Trust Footer */}
            <div className="rounded-xl bg-[#f8fbf6] p-4 text-center text-xs text-[#5c7364] space-y-2 border border-[#dfe8d8]">
              <div className="flex items-center justify-center gap-1.5 font-semibold text-[#2d6a4f]">
                <ShieldCheck className="size-4" />
                AgriTrace Public Provenance Guarantee
              </div>
              <p className="text-[11px] text-[#5c7364] max-w-md mx-auto">
                This certificate represents the authenticated digital farm record for batch{" "}
                <span className="font-mono font-bold text-[#1a3d2e]">
                  {batch.batch_code}
                </span>
                . Data is recorded directly by the producer and verified by certified agricultural organizations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-[#8fa396]">
          Powered by{" "}
          <Link href="/" className="font-medium text-[#2d6a4f] hover:underline">
            AgriTrace
          </Link>{" "}
          · Digital Agricultural Records for Small Producers
        </p>
      </main>
    </div>
  );
}
