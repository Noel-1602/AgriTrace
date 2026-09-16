import Link from "next/link";
import { LayoutDashboard, Leaf, QrCode, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/batch/new", label: "Batches", icon: Sprout },
  { href: "/scan", label: "Scan", icon: QrCode },
];

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-full bg-[#f4f7f2]">
      <header className="sticky top-0 z-40 border-b border-[#dfe8d8] bg-[#f4f7f2]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#1a3d2e]">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#2d6a4f] text-white">
              <Leaf className="size-4" />
            </span>
            AgriTrace
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#3d5a45] transition hover:bg-[#e8f0e4] hover:text-[#1a3d2e]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={cn("mx-auto max-w-5xl px-4 pb-24 pt-6 sm:pb-8", className)}>
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#dfe8d8] bg-white/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-5xl justify-around py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-[#5c7364]"
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
