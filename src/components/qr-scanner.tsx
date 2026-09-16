"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  FileImage,
  Keyboard,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function extractBatchCode(decodedText: string): string | null {
  const trimmed = decodedText.trim();

  // Pattern 1: /trace/BATCH-CODE or /trace/AGRI-YYYY-NNN
  const traceMatch = trimmed.match(/\/trace\/([a-zA-Z0-9_-]+)/i);
  if (traceMatch?.[1]) {
    return traceMatch[1].toUpperCase();
  }

  // Pattern 2: Direct batch code format like AGRI-2026-001
  const directMatch = trimmed.match(/^AGRI-\d{4}-\d{3,4}$/i);
  if (directMatch) {
    return trimmed.toUpperCase();
  }

  // Pattern 3: Any alphanumeric-hyphen code if reasonable
  if (/^[a-zA-Z0-9_-]{4,30}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

const scannerRegionId = "qr-reader-region";

export function QrScanner() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"camera" | "upload" | "manual">("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleSuccessfulScan = useCallback(
    (decodedText: string) => {
      const code = extractBatchCode(decodedText);
      if (code) {
        setScannedCode(code);
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        setTimeout(() => {
          router.push(`/trace/${code}`);
        }, 500);
      } else {
        setCameraError(
          `Scanned QR code ("${decodedText.slice(0, 30)}") is not a valid AgriTrace batch link.`,
        );
      }
    },
    [router],
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerRegionId);
      }

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {
          // ignore scan frame misses
        },
      );
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Camera access unavailable or permission denied.";
      setCameraError(
        `${errMsg} You can upload a photo of the QR code or enter the batch code manually below.`,
      );
      setMode("upload");
    }
  }, [handleSuccessfulScan]);

  useEffect(() => {
    let active = true;

    if (mode === "camera") {
      const timer = setTimeout(() => {
        if (active) {
          startCamera();
        }
      }, 100);
      return () => {
        active = false;
        clearTimeout(timer);
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
      };
    } else {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    }

    return () => {
      active = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [mode, startCamera]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setCameraError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerRegionId);
      }

      const decodedText = await scannerRef.current.scanFile(file, true);
      handleSuccessfulScan(decodedText);
    } catch {
      setCameraError(
        "Could not detect a readable QR code in this image. Please ensure the QR is well-lit and in focus, or enter the code manually.",
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    const code = extractBatchCode(manualCode);
    if (!code) {
      setManualError("Please enter a valid batch code (e.g., AGRI-2026-001).");
      return;
    }
    router.push(`/trace/${code}`);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* Mode selection tabs */}
      <div className="flex rounded-xl bg-[#e8f0e4]/70 p-1">
        <button
          type="button"
          onClick={() => setMode("camera")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition",
            mode === "camera"
              ? "bg-white text-[#1a3d2e] shadow-sm"
              : "text-[#5c7364] hover:text-[#1a3d2e]",
          )}
        >
          <Camera className="size-3.5" />
          Camera Scan
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition",
            mode === "upload"
              ? "bg-white text-[#1a3d2e] shadow-sm"
              : "text-[#5c7364] hover:text-[#1a3d2e]",
          )}
        >
          <FileImage className="size-3.5" />
          Upload Image
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition",
            mode === "manual"
              ? "bg-white text-[#1a3d2e] shadow-sm"
              : "text-[#5c7364] hover:text-[#1a3d2e]",
          )}
        >
          <Keyboard className="size-3.5" />
          Enter Code
        </button>
      </div>

      {scannedCode && (
        <Card className="border-[#2d6a4f] bg-[#e8f0e4] text-[#1a3d2e]">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-[#2d6a4f] shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-[#2d6a4f]">Found Batch Code</p>
              <p className="font-mono text-base font-bold">{scannedCode}</p>
            </div>
            <Loader2 className="size-4 animate-spin text-[#2d6a4f]" />
          </CardContent>
        </Card>
      )}

      {/* Camera View */}
      {mode === "camera" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#2d6a4f]/40 bg-black shadow-lg">
            <div
              id={scannerRegionId}
              className="min-h-[300px] w-full bg-black text-white"
            />

            {/* Viewfinder Target Overlays */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative size-56 rounded-xl border border-white/30">
                {/* Corners */}
                <div className="absolute -left-1 -top-1 size-6 border-l-4 border-t-4 border-[#52b788] rounded-tl" />
                <div className="absolute -right-1 -top-1 size-6 border-r-4 border-t-4 border-[#52b788] rounded-tr" />
                <div className="absolute -bottom-1 -left-1 size-6 border-b-4 border-l-4 border-[#52b788] rounded-bl" />
                <div className="absolute -bottom-1 -right-1 size-6 border-b-4 border-r-4 border-[#52b788] rounded-br" />

                {/* Animated scan line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#52b788] to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_8px_#52b788]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-[#5c7364]">
              Point camera at AgriTrace QR code on packaging
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={startCamera}
              className="text-xs text-[#2d6a4f]"
            >
              <RefreshCw className="size-3 mr-1" />
              Restart
            </Button>
          </div>
        </div>
      )}

      {/* Image Upload Mode */}
      {mode === "upload" && (
        <Card className="border-2 border-dashed border-[#c5d9c8] bg-white">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#e8f0e4] text-[#2d6a4f]">
              {uploadLoading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <FileImage className="size-6" />
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#1a3d2e]">
                Upload QR Code Photo
              </h3>
              <p className="mt-1 text-xs text-[#5c7364]">
                Select a photo or screenshot containing the AgriTrace QR code.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="bg-[#2d6a4f] hover:bg-[#24543f] text-white"
            >
              {uploadLoading ? "Scanning Image…" : "Choose Image File"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manual Input Mode */}
      {mode === "manual" && (
        <Card className="border-[#dfe8d8] bg-white shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="manual-code"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#5c7364]"
                >
                  Batch Identifier
                </label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="manual-code"
                    type="text"
                    placeholder="e.g. AGRI-2026-001"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="font-mono uppercase tracking-wider border-[#c5d9c8]"
                  />
                  <Button
                    type="submit"
                    className="bg-[#2d6a4f] hover:bg-[#24543f] text-white shrink-0"
                  >
                    Trace <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
                {manualError && (
                  <p className="mt-1.5 text-xs text-destructive">{manualError}</p>
                )}
              </div>

              <div className="rounded-lg bg-[#f8fbf6] p-3 text-xs text-[#5c7364] border border-[#eef3ea]">
                <p className="font-semibold text-[#1a3d2e] flex items-center gap-1 mb-1.5">
                  <Sparkles className="size-3 text-[#2d6a4f]" /> Quick Demo Codes:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode("AGRI-2026-001");
                      router.push("/trace/AGRI-2026-001");
                    }}
                    className="rounded bg-white px-2 py-1 font-mono text-xs border border-[#c5d9c8] text-[#2d6a4f] hover:bg-[#e8f0e4]"
                  >
                    AGRI-2026-001 (Tomato)
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {cameraError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div>{cameraError}</div>
        </div>
      )}
    </div>
  );
}
