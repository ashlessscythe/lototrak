"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();

  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage user accounts and roles",
      link: "/admin/users",
      icon: "👥",
    },
    {
      title: "Lock Management",
      description: "Manage locks and assignments",
      link: "/admin/locks",
      icon: "🔒",
    },
    {
      title: "Event Logs",
      description: "View system events and audit logs",
      link: "/admin/events",
      icon: "📋",
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      link: "/admin/settings",
      icon: "⚙️",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Welcome back, {session?.user?.email} ({session?.user?.role})
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminFeatures.map((feature) => (
          <Link key={feature.title} href={feature.link}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{feature.icon}</span>
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Click to manage
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending Users</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Locks</CardTitle>
            <CardDescription>Currently in use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
