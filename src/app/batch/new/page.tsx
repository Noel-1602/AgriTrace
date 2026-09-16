import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CreateBatchForm } from "@/components/create-batch-form";
import {
  isSupabaseConfigured,
  SupabaseSetupBanner,
} from "@/components/supabase-setup-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFarmerFarms } from "@/lib/queries/batches";

export default async function NewBatchPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AppShell>
        <SupabaseSetupBanner />
      </AppShell>
    );
  }

  const { farms, error } = await getFarmerFarms();

  return (
    <AppShell className="max-w-xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-[#5c7364] hover:text-[#2d6a4f]"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[#1a3d2e]">Create batch</h1>
        <p className="text-sm text-[#5c7364]">
          A unique batch code (e.g. AGRI-2026-002) will be generated automatically.
        </p>
      </div>

      <Card className="border-[#dfe8d8] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1a3d2e]">Crop information</CardTitle>
          <CardDescription>
            Record what you are growing and where. All fields follow PRD validation rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}
          {farms.length === 0 ? (
            <p className="text-sm text-[#5c7364]">
              No farms found for the demo farmer. Run the seed SQL in Supabase first.
            </p>
          ) : (
            <CreateBatchForm farms={farms} />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
