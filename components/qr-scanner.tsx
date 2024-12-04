"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface QRScannerProps {
  onScanSuccess: (lockId: string) => void;
  onScanError: (error: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      if (!videoRef.current) return;

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log("QR code detected:", result);
          if (result.data) {
            onScanSuccess(result.data);
            stopScanning();
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
    } catch (error) {
      console.error("Scanner initialization error:", error);
      onScanError(
        "Failed to initialize scanner. Please check camera permissions."
      );
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      console.log("Processing file:", file.name);
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      console.log("Scan result:", result);

      if (result.data) {
        onScanSuccess(result.data);
      } else {
        throw new Error("No QR code found in image");
      }
    } catch (error) {
      console.error("File scanning error:", error);
      onScanError(
        "Could not read QR code from image. Please try another image or use camera scanning."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload QR Code Image</h3>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="w-full"
            />
            {isProcessing && (
              <p className="text-sm text-muted-foreground mt-2">
                Processing image...
              </p>
            )}
          </div>
          <div className="relative">
            <h3 className="text-lg font-semibold mb-2">Or Scan with Camera</h3>
            <div className="w-full max-w-sm mx-auto aspect-square relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          {!isScanning ? (
            <Button onClick={startScanning} disabled={isProcessing}>
              Start Camera Scanning
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={stopScanning}
              disabled={isProcessing}
            >
              Stop Scanning
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
