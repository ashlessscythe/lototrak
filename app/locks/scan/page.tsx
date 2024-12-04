"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRScanner } from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface LockDetails extends Lock {
  safetyProcedures: string[];
}

export default function ScanPage() {
  const [lockDetails, setLockDetails] = useState<LockDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedChecks, setCompletedChecks] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleScanSuccess = async (lockId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Scanned lock ID:", lockId);
      const response = await fetch(`/api/locks/${lockId}`);

      if (response.status === 404) {
        throw new Error("Invalid QR code. Lock not found in the system.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || "Failed to fetch lock details. Please try again."
        );
      }

      const lock = await response.json();
      console.log("Fetched lock details:", lock);
      setLockDetails(lock);
      setCompletedChecks([]);

      toast({
        title: "QR Code Scanned Successfully",
        description: `Found lock: ${lock.name}`,
      });
    } catch (error) {
      console.error("Lock fetch error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error("Scan error:", error);
    setError(error);
    toast({
      title: "Scan Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleCheckChange = (procedure: string, checked: boolean) => {
    setCompletedChecks((prev) =>
      checked ? [...prev, procedure] : prev.filter((p) => p !== procedure)
    );
  };

  const handleAssign = async () => {
    if (!lockDetails) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/locks/${lockDetails.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ safetyChecks: completedChecks }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast({
        title: "Success",
        description: "Lock assigned successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign lock";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!lockDetails) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/locks/${lockDetails.id}/release`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast({
        title: "Success",
        description: "Lock released successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to release lock";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const allChecksCompleted =
    lockDetails?.safetyProcedures?.length === completedChecks.length;

  if (isLoading && !lockDetails) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Processing QR code...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan Lock QR Code</CardTitle>
          <CardDescription>
            Scan a lock&apos;s QR code to assign or release it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!lockDetails ? (
            <div className="space-y-6">
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
              <p className="text-sm text-muted-foreground text-center">
                Position the QR code within the camera frame or upload an image
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{lockDetails.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Location: {lockDetails.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {lockDetails.status}
                </p>
              </div>

              {lockDetails.status === "AVAILABLE" && (
                <div className="space-y-4">
                  <h4 className="font-medium">Safety Procedures</h4>
                  <div className="space-y-2">
                    {lockDetails.safetyProcedures.map((procedure) => (
                      <div
                        key={procedure}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={procedure}
                          checked={completedChecks.includes(procedure)}
                          onCheckedChange={(checked) =>
                            handleCheckChange(procedure, checked as boolean)
                          }
                          disabled={isLoading}
                        />
                        <label
                          htmlFor={procedure}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {procedure}
                        </label>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleAssign}
                    disabled={!allChecksCompleted || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Lock"
                    )}
                  </Button>
                </div>
              )}

              {lockDetails.status === "IN_USE" && (
                <Button
                  onClick={handleRelease}
                  disabled={isLoading}
                  className="w-full"
                  variant="destructive"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Releasing...
                    </>
                  ) : (
                    "Release Lock"
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setLockDetails(null);
                  setError(null);
                  setCompletedChecks([]);
                }}
                disabled={isLoading}
              >
                Scan Different Lock
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
