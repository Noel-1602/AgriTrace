import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "border-[#dfe8d8] bg-white shadow-sm shadow-[#2d6a4f]/5",
        className,
      )}
    >
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#5c7364]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-[#1a3d2e]">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
