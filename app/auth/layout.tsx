export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/auth";

export const metadata: Metadata = {
  title: "Authentication - LotoTrak",
  description: "Authentication pages for LotoTrak",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If user is already authenticated and not on the pending page,
  // redirect based on their role
  if (session?.user) {
    if (session.user.role === "PENDING") {
      redirect("/auth/pending");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="relative flex-col items-center justify-center flex">
          {children}
        </div>
      </div>
    </div>
  );
}
