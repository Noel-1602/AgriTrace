import Link from "next/link";
import { ArrowRight, Leaf, QrCode } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="min-h-full bg-[#f4f7f2]">
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-6 py-12 sm:max-w-2xl sm:py-20">
        <div className="mb-8 flex items-center gap-2 text-[#2d6a4f]">
          <Leaf className="size-6" />
          <span className="text-sm font-semibold tracking-widest">AGRI-TRACE</span>
        </div>

        <h1 className="text-4xl font-semibold leading-tight text-[#1a3d2e] sm:text-5xl">
          From Farm to Consumer.
          <br />
          Every Product. Every Story.
        </h1>

        <p className="mt-5 max-w-md text-lg text-[#5c7364]">
          Digital agricultural records and QR-powered product traceability for small
          producers.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 bg-[#2d6a4f] text-base hover:bg-[#24543f]",
            )}
          >
            Farmer Dashboard
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/scan"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-12 border-[#c5d9c8] bg-white text-base text-[#1a3d2e]",
            )}
          >
            <QrCode className="size-4" />
            Scan Product
          </Link>
        </div>

        <p className="mt-16 text-center text-sm font-medium tracking-wide text-[#8fa396] sm:text-left">
          Farm → Record → Verify → Scan → Trust
        </p>
      </div>
    </div>
  );
}
