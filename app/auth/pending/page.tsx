"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="relative">
          <Button variant="ghost" className="absolute left-4 top-4" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
          <div className="pt-10">
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your account is currently pending administrator approval
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please wait while an administrator reviews and activates your
            account. This process helps us maintain security and verify all
            users.
          </p>
          <p className="text-sm text-muted-foreground">
            You will be notified via email once your account has been approved.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
