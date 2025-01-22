"use client";

import { useState, useMemo } from "react";
import { DateCell } from "@/components/date-cell";
import {
  formatDateWithSettings,
  formatRelativeTimeWithSettings,
} from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EventType, Status } from "@prisma/client";

type Event = {
  id: string;
  type: EventType;
  details: string;
  location: string;
  lockName: string;
  lockStatus: Status;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdAt: Date;
};

type Props = {
  events: Event[];
  settings: Record<string, string>;
};

export function EventsTable({ events: initialEvents, settings }: Props) {
  // Filter states
  const [eventType, setEventType] = useState<EventType | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState<string>("ALL");
  const [locationFilter, setLocationFilter] = useState<string>("ALL");

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Event | "user.name";
    direction: "asc" | "desc";
  }>({
    key: "createdAt",
    direction: "desc",
  });

  // Get unique users for filter dropdown
  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    initialEvents.forEach((event) => {
      if (event.user?.name) users.add(event.user.name);
      else if (event.user?.email) users.add(event.user.email);
    });
    return Array.from(users);
  }, [initialEvents]);

  // Get unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(initialEvents.map((event) => event.location)));
  }, [initialEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return initialEvents
      .filter((event) => {
        const matchesType = eventType === "ALL" || event.type === eventType;
        const matchesDate =
          !dateFilter ||
          (() => {
            const filterDate = new Date(dateFilter + "T00:00:00Z");
            const eventDate = new Date(event.createdAt);

            // Convert both dates to UTC for comparison
            const filterUTC = new Date(
              Date.UTC(
                filterDate.getUTCFullYear(),
                filterDate.getUTCMonth(),
                filterDate.getUTCDate()
              )
            );
            const eventUTC = new Date(
              Date.UTC(
                eventDate.getUTCFullYear(),
                eventDate.getUTCMonth(),
                eventDate.getUTCDate()
              )
            );

            return filterUTC.getTime() === eventUTC.getTime();
          })();
        const matchesUser =
          userFilter === "ALL" ||
          (event.user?.name && event.user.name === userFilter) ||
          (event.user?.email && event.user.email === userFilter);
        const matchesLocation =
          locationFilter === "ALL" || event.location === locationFilter;

        return matchesType && matchesDate && matchesUser && matchesLocation;
      })
      .sort((a, b) => {
        const getValue = (
          event: Event,
          key: typeof sortConfig.key
        ): string | Date => {
          if (key === "user.name") {
            return event.user?.name || event.user?.email || "";
          }

          if (key === "createdAt") {
            return event.createdAt;
          }

          return String(event[key] ?? "");
        };

        const aValue = getValue(a, sortConfig.key);
        const bValue = getValue(b, sortConfig.key);

        // Compare dates directly
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        // Compare strings
        const aString = String(aValue);
        const bString = String(bValue);

        if (aString < bString) return sortConfig.direction === "asc" ? -1 : 1;
        if (aString > bString) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    initialEvents,
    eventType,
    dateFilter,
    userFilter,
    locationFilter,
    sortConfig,
  ]);

  const handleSort = (key: keyof Event | "user.name") => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={eventType}
          onValueChange={(value) => setEventType(value as EventType | "ALL")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="text-foreground bg-background border border-border shadow-md rounded-md">
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.values(EventType).map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Filter by date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          type="date"
        />

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent className="text-foreground bg-background border border-border shadow-md rounded-md">
            <SelectItem value="ALL">All Locations</SelectItem>
            {uniqueLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent className="text-foreground bg-background border border-border shadow-md rounded-md">
            <SelectItem value="ALL">All Users</SelectItem>
            {uniqueUsers.map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table view for desktop */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("type")}
              >
                Type{" "}
                {sortConfig.key === "type" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Lock</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("location")}
              >
                Location{" "}
                {sortConfig.key === "location" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("user.name")}
              >
                User{" "}
                {sortConfig.key === "user.name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Date{" "}
                {sortConfig.key === "createdAt" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
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
                    settings={settings}
                    formattedDate={formatDateWithSettings(
                      event.createdAt,
                      settings
                    )}
                    relativeTime={formatRelativeTimeWithSettings(
                      event.createdAt,
                      settings
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filteredEvents.length === 0 && (
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
        {filteredEvents.map((event) => (
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
                  settings={settings}
                  formattedDate={formatDateWithSettings(
                    event.createdAt,
                    settings
                  )}
                  relativeTime={formatRelativeTimeWithSettings(
                    event.createdAt,
                    settings
                  )}
                />
              </div>

              <div>
                <p className="text-sm font-medium">Lock Information</p>
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
                  {event.user?.name || event.user?.email || "Deleted User"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
