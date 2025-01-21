import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DateCell } from "@/components/date-cell";
import { authOptions } from "@/app/auth";
import {
  formatDateWithSettings,
  formatRelativeTimeWithSettings,
} from "@/lib/utils";

// Mark page as dynamic
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["SUPERVISOR", "ADMIN"].includes(session.user.role)) {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Lock</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {event.type.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>{event.details}</TableCell>
                  <TableCell>{event.lockName || "Lock Removed"}</TableCell>
                  <TableCell>{event.location || "Location Unknown"}</TableCell>
                  <TableCell>{event.lockStatus || "Unknown"}</TableCell>
                  <TableCell>
                    {event.user?.name || event.user?.email || "Deleted User"}
                  </TableCell>
                  <TableCell>
                    <DateCell
                      date={event.createdAt}
                      settings={settingsMap}
                      formattedDate={formatDateWithSettings(
                        event.createdAt,
                        settingsMap
                      )}
                      relativeTime={formatRelativeTimeWithSettings(
                        event.createdAt,
                        settingsMap
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
