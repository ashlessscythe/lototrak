export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/auth";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Admin - LotoTrak",
  description: "Admin dashboard for LotoTrak",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only allow ADMIN and SUPERVISOR roles
  if (!["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen bg-background">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <Toaster />
    </div>
  );
}
