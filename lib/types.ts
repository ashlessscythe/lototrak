import { Role } from "@prisma/client";

export { Role };

export type Status = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";
export type EventType =
  | "LOCK_ASSIGNED"
  | "LOCK_RELEASED"
  | "STATUS_CHANGED"
  | "MAINTENANCE"
  | "EMERGENCY_OVERRIDE";

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  companyId: string;
  company: Company;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  departments: {
    department: Department;
    assignedAt: Date;
  }[];
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
