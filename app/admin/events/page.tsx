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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No events found
              </div>
            ) : (
              <>
                {/* Table view for desktop */}
                <div className="hidden md:block overflow-x-auto">
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
                          <TableCell>
                            {event.lockName || "Lock Removed"}
                          </TableCell>
                          <TableCell>
                            {event.location || "Location Unknown"}
                          </TableCell>
                          <TableCell>{event.lockStatus || "Unknown"}</TableCell>
                          <TableCell>
                            {event.user?.name ||
                              event.user?.email ||
                              "Deleted User"}
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
                </div>

                {/* Card view for mobile */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {events.map((event) => (
                    <Card key={event.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {event.type.replace(/_/g, " ")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {event.details}
                            </p>
                          </div>
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
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            Lock Information
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Name: {event.lockName || "Lock Removed"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Location: {event.location || "Location Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: {event.lockStatus || "Unknown"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium">User</p>
                          <p className="text-sm text-muted-foreground">
                            {event.user?.name ||
                              event.user?.email ||
                              "Deleted User"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
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
