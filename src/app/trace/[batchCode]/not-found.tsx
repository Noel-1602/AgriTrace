import Link from "next/link";
import { AlertCircle, ArrowLeft, QrCode, Sprout } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function TraceNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f2] text-[#1a3d2e]">
      <header className="border-b border-[#dfe8d8] bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#2d6a4f] text-white">
              <Sprout className="size-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#1a3d2e]">
              AGRITRACE
            </span>
          </Link>
          <Link
            href="/scan"
            className="flex items-center gap-1 text-xs text-[#2d6a4f] hover:underline"
          >
            <QrCode className="size-3.5" />
            Scan QR
          </Link>
        </div>
      </header>

      <main className="mx-auto my-auto max-w-md px-4 py-12 text-center">
        <Card className="border-[#dfe8d8] bg-white p-6 shadow-md">
          <CardContent className="space-y-4 pt-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertCircle className="size-7" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#1a3d2e]">Batch Not Found</h1>
              <p className="mt-2 text-sm text-[#5c7364]">
                This QR code does not correspond to a registered agricultural batch.
              </p>
            </div>

            <div className="rounded-xl bg-[#f8fbf6] p-3 text-xs text-[#5c7364] border border-[#eef3ea]">
              Please double check the batch code or re-scan the QR code printed on the physical packaging.
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Link
                href="/scan"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "flex-1 bg-[#2d6a4f] hover:bg-[#24543f] text-white",
                )}
              >
                <QrCode className="size-4 mr-1.5" />
                Scan QR Again
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex-1 border-[#c5d9c8] text-[#1a3d2e] hover:bg-[#f4f7f2]",
                )}
              >
                <ArrowLeft className="size-4 mr-1.5" />
                Return Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
