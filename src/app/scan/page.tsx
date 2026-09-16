import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { QrScanner } from "@/components/qr-scanner";

export default function ScanPage() {
  return (
    <AppShell className="max-w-xl">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#2d6a4f]">
          AgriTrace Consumer Verification
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#1a3d2e] sm:text-3xl">
          Scan Product QR
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#5c7364]">
          Scan the QR code printed on the agricultural package or crate to view full origin,
          cultivation timeline, GPS location, and certificate of verification.
        </p>
      </div>

      <QrScanner />

      <div className="mt-8 text-center text-xs text-[#8fa396]">
        <p>No account or login required for consumers.</p>
        <p className="mt-1">
          Are you a farmer?{" "}
          <Link href="/dashboard" className="text-[#2d6a4f] underline hover:text-[#1a3d2e]">
            Go to Farmer Dashboard
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
