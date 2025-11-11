import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/auth";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

export default async function LocksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role === "PENDING") {
    redirect("/auth/pending");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}
