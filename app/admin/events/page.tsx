import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventsTable } from "./events-table";

// Mark page as dynamic
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !["ADMIN", "SUPERVISOR", "MANAGER"].includes(session.user.role)
  ) {
    redirect("/auth/signin");
  }

  try {
    // Fetch events and settings in parallel
    const [events, settings] = await Promise.all([
      prisma.event.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.systemSettings.findMany(),
    ]);

    // Convert settings array to object
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Events</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No events found
              </div>
            ) : (
              <EventsTable events={events} settings={settingsMap} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Events</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load events. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
