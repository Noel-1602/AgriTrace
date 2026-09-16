"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Download, ExternalLink, Printer, QrCode } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};
const getClientOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : "";
const getServerOrigin = () => "";

interface BatchQrCardProps {
  batchCode: string;
  cropName: string;
  variety?: string | null;
  farmName?: string | null;
}

export function BatchQrCard({
  batchCode,
  cropName,
  variety,
  farmName,
}: BatchQrCardProps) {
  const origin = useSyncExternalStore(
    emptySubscribe,
    getClientOrigin,
    getServerOrigin,
  );
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const traceUrl = origin ? `${origin}/trace/${batchCode}` : `/trace/${batchCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(traceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create a high-res printable composite on a new canvas
    const downloadCanvas = document.createElement("canvas");
    const padding = 24;
    const headerHeight = 60;
    const footerHeight = 40;
    const size = 300;

    downloadCanvas.width = size + padding * 2;
    downloadCanvas.height = size + headerHeight + footerHeight + padding * 2;
    const ctx = downloadCanvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    // Border
    ctx.strokeStyle = "#2d6a4f";
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, downloadCanvas.width - 16, downloadCanvas.height - 16);

    // Header text
    ctx.fillStyle = "#1a3d2e";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`AGRITRACE · ${cropName.toUpperCase()}`, downloadCanvas.width / 2, padding + 24);

    ctx.fillStyle = "#5c7364";
    ctx.font = "12px sans-serif";
    const subText = [farmName, variety].filter(Boolean).join(" · ") || "Verified Agricultural Batch";
    ctx.fillText(subText, downloadCanvas.width / 2, padding + 44);

    // Draw QR Code
    ctx.drawImage(canvas, padding, padding + headerHeight, size, size);

    // Footer text
    ctx.fillStyle = "#1a3d2e";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`BATCH: ${batchCode}`, downloadCanvas.width / 2, downloadCanvas.height - padding - 16);

    ctx.fillStyle = "#8fa396";
    ctx.font = "10px sans-serif";
    ctx.fillText("Scan with phone camera to trace origin", downloadCanvas.width / 2, downloadCanvas.height - padding);

    const dataUrl = downloadCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${batchCode}-qr.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const qrImgData = canvas.toDataURL("image/png");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR - ${batchCode}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
              .label {
                width: 320px;
                border: 2px solid #2d6a4f;
                border-radius: 12px;
                padding: 16px;
                text-align: center;
                margin: 0 auto;
                background: #ffffff;
                page-break-inside: avoid;
              }
              .logo { font-size: 11px; letter-spacing: 2px; color: #2d6a4f; font-weight: bold; margin-bottom: 4px; }
              .crop { font-size: 20px; font-weight: bold; color: #1a3d2e; margin: 0 0 2px 0; text-transform: uppercase; }
              .farm { font-size: 12px; color: #5c7364; margin-bottom: 12px; }
              .qr-img { width: 200px; height: 200px; margin: 0 auto 12px auto; display: block; }
              .code { font-family: monospace; font-size: 15px; font-weight: bold; color: #1a3d2e; margin-bottom: 4px; }
              .url { font-size: 10px; color: #718096; word-break: break-all; margin-bottom: 6px; }
              .tag { font-size: 10px; color: #2d6a4f; background: #e8f0e4; padding: 2px 8px; border-radius: 9999px; display: inline-block; }
            }
            body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f4f7f2; font-family: sans-serif; }
            .label { width: 320px; border: 2px solid #2d6a4f; border-radius: 12px; padding: 16px; text-align: center; background: white; }
            .logo { font-size: 11px; letter-spacing: 2px; color: #2d6a4f; font-weight: bold; margin-bottom: 4px; }
            .crop { font-size: 20px; font-weight: bold; color: #1a3d2e; margin: 0 0 2px 0; text-transform: uppercase; }
            .farm { font-size: 12px; color: #5c7364; margin-bottom: 12px; }
            .qr-img { width: 200px; height: 200px; margin: 0 auto 12px auto; display: block; }
            .code { font-family: monospace; font-size: 15px; font-weight: bold; color: #1a3d2e; margin-bottom: 4px; }
            .url { font-size: 10px; color: #718096; word-break: break-all; margin-bottom: 6px; }
            .tag { font-size: 10px; color: #2d6a4f; background: #e8f0e4; padding: 2px 8px; border-radius: 9999px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="logo">AGRITRACE TRACEABILITY</div>
            <h1 class="crop">${cropName}</h1>
            <div class="farm">${farmName || "Verified Farm"}${variety ? ` · ${variety}` : ""}</div>
            <img src="${qrImgData}" class="qr-img" alt="QR Code" />
            <div class="code">BATCH: ${batchCode}</div>
            <div class="url">${traceUrl}</div>
            <div class="tag">✓ Verified Digital Certificate</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card className="border-[#dfe8d8] bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-[#f8fbf6] border-b border-[#dfe8d8] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#e8f0e4] text-[#2d6a4f]">
            <QrCode className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base text-[#1a3d2e]">Batch QR Code</CardTitle>
            <CardDescription className="text-xs text-[#5c7364]">
              Public consumer traceability link
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div
            ref={canvasRef}
            className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#dfe8d8] bg-white p-4 shadow-sm"
          >
            <QRCodeCanvas
              value={traceUrl}
              size={160}
              level="H"
              includeMargin={false}
              className="rounded"
            />
            <span className="mt-2 font-mono text-xs font-semibold text-[#1a3d2e]">
              {batchCode}
            </span>
          </div>

          <div className="flex-1 space-y-4 text-center sm:text-left w-full">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5c7364]">
                Public Trace URL
              </p>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#dfe8d8] bg-[#f8fbf6] p-2">
                <span className="truncate font-mono text-xs text-[#3d5a45] select-all flex-1 text-left">
                  {traceUrl}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopy}
                  className="size-7 shrink-0 text-[#2d6a4f] hover:bg-[#e8f0e4]"
                  title="Copy link"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="border-[#c5d9c8] text-[#1a3d2e] hover:bg-[#f4f7f2]"
              >
                <Download className="size-3.5 mr-1.5 text-[#2d6a4f]" />
                Download QR
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-[#c5d9c8] text-[#1a3d2e] hover:bg-[#f4f7f2]"
              >
                <Printer className="size-3.5 mr-1.5 text-[#2d6a4f]" />
                Print QR
              </Button>
              <Link
                href={`/trace/${batchCode}`}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-[#2d6a4f] hover:bg-[#e8f0e4]",
                )}
              >
                <ExternalLink className="size-3.5 mr-1.5" />
                Preview Public Trace
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
