export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/auth";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Dashboard - LotoTrak",
  description: "Manage your lockout tagout tracking",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Redirect PENDING users to pending page
  if (session.user.role === "PENDING") {
    redirect("/auth/pending");
  }

  return (
    <div className="relative min-h-screen bg-background">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <Toaster />
    </div>
  );
}