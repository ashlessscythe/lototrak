import { Role as PrismaRole } from "@prisma/client";

export type Role = PrismaRole;

export type Status = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";
export type EventType =
  | "LOCK_ASSIGNED"
  | "LOCK_RELEASED"
  | "STATUS_CHANGED"
  | "MAINTENANCE"
  | "EMERGENCY_OVERRIDE";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lock {
  id: string;
  name: string;
  location: string;
  status: Status;
  qrCode: string;
  safetyProcedures?: string[] | null;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  type: EventType;
  details: string;
  lockId: string;
  userId: string;
  createdAt: Date;
}
