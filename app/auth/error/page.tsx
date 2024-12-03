"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorDetails = () => {
    switch (error) {
      case "CredentialsSignin":
        return {
          title: "Invalid Credentials",
          description: "The email or password you entered is incorrect.",
          showSignUp: true,
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You don't have permission to access this resource.",
          showSignUp: false,
        };
      case "PendingApproval":
        return {
          title: "Account Pending Approval",
          description:
            "Your account is awaiting administrator approval. Please check back later.",
          showSignUp: false,
        };
      default:
        return {
          title: "Authentication Error",
          description:
            "An error occurred during authentication. Please try again.",
          showSignUp: true,
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="relative">
          <Button variant="ghost" className="absolute left-4 top-4" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
          <div className="pt-10">
            <CardTitle className="text-destructive">
              {errorDetails.title}
            </CardTitle>
            <CardDescription>{errorDetails.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/auth/signin">Try Again</Link>
          </Button>
          {errorDetails.showSignUp && (
            <Button variant="outline" asChild>
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
