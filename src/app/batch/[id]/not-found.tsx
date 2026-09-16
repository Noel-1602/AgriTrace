import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BatchNotFound() {
  return (
    <AppShell>
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold text-[#1a3d2e]">Batch not found</h1>
        <p className="mt-2 text-sm text-[#5c7364]">
          This batch does not exist or was removed.
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants(),
            "mt-6 bg-[#2d6a4f] hover:bg-[#24543f]",
          )}
        >
          Back to dashboard
        </Link>
      </div>
    </AppShell>
  );
}
