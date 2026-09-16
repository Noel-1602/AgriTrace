"use client";

import { format } from "date-fns";
import { ArrowRight, History } from "lucide-react";
import type { AuditLog } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuditHistory({ auditLogs }: { auditLogs: AuditLog[] }) {
  if (auditLogs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#dfe8d8] bg-white/60 p-6 text-center text-xs text-[#5c7364]">
        No audit logs recorded yet. All batch creations and modifications are tracked automatically.
      </div>
    );
  }

  return (
    <Card className="border-[#dfe8d8] bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-[#f8fbf6] border-b border-[#dfe8d8] pb-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-[#2d6a4f]" />
          <CardTitle className="text-sm font-semibold text-[#1a3d2e]">
            Audit & Change History
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-[#eef3ea]">
        {auditLogs.map((log) => {
          const hasChangeValues = log.old_value !== null && log.new_value !== null;
          const formattedDate = format(new Date(log.created_at), "d MMM yyyy");
          const formattedTime = format(new Date(log.created_at), "HH:mm");

          return (
            <div key={log.id} className="p-4 text-xs transition hover:bg-[#f8fbf6]/50">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#1a3d2e] text-sm">
                    {log.action}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#5c7364]">
                    Edited by: <span className="font-medium text-[#1a3d2e]">{log.edited_by || "System"}</span>
                    {" · "}
                    <span className="text-[#8fa396]">{formattedDate}, {formattedTime}</span>
                  </p>
                </div>
              </div>

              {hasChangeValues && (
                <div className="mt-2.5 rounded-lg border border-[#dfe8d8] bg-[#f8fbf6] p-2.5 text-xs">
                  <div className="flex items-center gap-2 text-[#3d5a45]">
                    <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono">
                      Old: {log.old_value || "None"}
                    </span>
                    <ArrowRight className="size-3 text-[#5c7364] shrink-0" />
                    <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium">
                      New: {log.new_value || "None"}
                    </span>
                  </div>
                </div>
              )}

              {!hasChangeValues && log.new_value && (
                <p className="mt-1 text-[#5c7364] font-mono text-[11px]">
                  Value: {log.new_value}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
