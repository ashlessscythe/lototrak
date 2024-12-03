"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Role } from "@/lib/types";
import Link from "next/link";

export default function Dashboard() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role;

  const getRoleColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "text-red-600 dark:text-red-400";
      case "SUPERVISOR":
        return "text-blue-600 dark:text-blue-400";
      case "USER":
        return "text-green-600 dark:text-green-400";
      case "PENDING":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const isAdminUser = ["ADMIN", "SUPERVISOR"].includes(userRole);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Welcome, {session?.user?.email}</CardTitle>
                <CardDescription>
                  Role:{" "}
                  <span className={getRoleColor(userRole)}>{userRole}</span>
                </CardDescription>
              </div>
              {isAdminUser && (
                <Button asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full">View Locks</Button>
                  <Button className="w-full" variant="outline">
                    View Events
                  </Button>
                  {isAdminUser && (
                    <Button className="w-full" variant="secondary" asChild>
                      <Link href="/admin/users">Manage Users</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No recent activity
                  </p>
                </CardContent>
              </Card>

              {/* Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      All systems operational
                    </p>
                    {isAdminUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link href="/admin">View System Status</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Locks</CardTitle>
              <CardDescription>Currently assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No locks currently assigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Your recent lock interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent events</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
