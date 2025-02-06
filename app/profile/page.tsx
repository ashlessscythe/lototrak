import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDistance } from "date-fns";
import { Lock, User, Event } from "@prisma/client";

type UserWithRelations = User & {
  locks: Lock[];
  events: Event[];
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      locks: {
        where: { deleted: false },
        orderBy: { updatedAt: "desc" },
      },
      events: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const userData = user as UserWithRelations | null;

  if (!userData) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-4rem)]">
      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader className="px-6">
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            {userData.name && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <div className="p-2 bg-muted rounded-md">{userData.name}</div>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <div className="p-2 bg-muted rounded-md">{userData.email}</div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role</label>
              <div className="p-2 bg-muted rounded-md capitalize">
                {userData.role.toLowerCase()}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Member Since</label>
              <div className="p-2 bg-muted rounded-md">
                {formatDistance(userData.createdAt, new Date(), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {userData.locks.length > 0 && (
          <Card className="w-full">
            <CardHeader className="px-6">
              <CardTitle>Assigned Locks</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="divide-y">
                {userData.locks.map((lock) => (
                  <div key={lock.id} className="py-3">
                    <div className="font-medium">{lock.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Location: {lock.location}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      Status: {lock.status.toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {userData.events.length > 0 && (
          <Card className="w-full">
            <CardHeader className="px-6">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="divide-y">
                {userData.events.map((event) => (
                  <div key={event.id} className="py-3">
                    <div className="font-medium capitalize">
                      {event.type.toLowerCase().replace(/_/g, " ")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.details}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistance(event.createdAt, new Date(), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
