import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="px-6">
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <div className="p-2 bg-muted rounded-md">{session.user.email}</div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Role</label>
            <div className="p-2 bg-muted rounded-md capitalize">
              {session.user.role?.toLowerCase()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
