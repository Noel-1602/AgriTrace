import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import {
  isSupabaseConfigured,
  SupabaseSetupBanner,
} from "@/components/supabase-setup-banner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AppShell>
        <SupabaseSetupBanner />
      </AppShell>
    );
  }

  const { farmer, stats, recentBatches, error } = await getDashboardData();

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#5c7364]">Farmer Dashboard</p>
            <h1 className="text-2xl font-semibold text-[#1a3d2e] sm:text-3xl">
              Welcome, {farmer?.name?.split(" ")[0] ?? "Farmer"}
            </h1>
          </div>
          <Link
            href="/batch/new"
            className={cn(
              buttonVariants(),
              "bg-[#2d6a4f] hover:bg-[#24543f]",
            )}
          >
            <Plus className="size-4" />
            Create New Batch
          </Link>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Batches" value={stats.totalBatches} />
          <StatCard label="Active Crops" value={stats.activeCrops} />
          <StatCard label="Harvested" value={stats.harvested} />
          <StatCard label="Verified" value={stats.verified} />
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#1a3d2e]">Recent Batches</h2>
          {recentBatches.length === 0 ? (
            <Card className="border-dashed border-[#dfe8d8] bg-white/60">
              <CardContent className="py-10 text-center text-sm text-[#5c7364]">
                No batches yet. Create your first batch to start traceability.
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-3">
              {recentBatches.map((batch) => (
                <li key={batch.id}>
                  <Card className="border-[#dfe8d8] bg-white shadow-sm transition hover:border-[#2d6a4f]/30">
                    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                      <div>
                        <CardTitle className="text-base text-[#1a3d2e]">
                          {batch.crop_name}
                        </CardTitle>
                        <p className="font-mono text-xs text-[#5c7364]">
                          {batch.batch_code}
                        </p>
                        <p className="text-sm text-[#5c7364]">
                          {batch.farms?.farm_name ?? "Farm"}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-[#e8f0e4] text-[#2d6a4f]"
                      >
                        {batch.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link
                        href={`/batch/${batch.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "border-[#c5d9c8]",
                        )}
                      >
                        View Batch
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
