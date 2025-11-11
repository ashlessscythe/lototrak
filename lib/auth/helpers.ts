import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/auth";
import { Role } from "@/lib/types";

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
  };
}

/**
 * Require authentication and return session
 * Returns null if not authenticated (caller should handle response)
 */
export async function requireAuth(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  // Ensure user is not PENDING
  if (session.user.role === "PENDING") {
    return null;
  }

  return session as AuthSession;
}

/**
 * Require authentication and return error response if not authenticated
 */
export async function requireAuthResponse(): Promise<
  AuthSession | NextResponse
> {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  return session;
}

/**
 * Require specific role(s) and return session or error response
 */
export async function requireRole(
  allowedRoles: Role[]
): Promise<AuthSession | NextResponse> {
  const session = await requireAuth();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Require ADMIN role
 */
export async function requireAdmin(): Promise<AuthSession | NextResponse> {
  return requireRole(["ADMIN"]);
}

/**
 * Require ADMIN or MANAGER role
 */
export async function requireAdminOrManager(): Promise<
  AuthSession | NextResponse
> {
  return requireRole(["ADMIN", "MANAGER"]);
}

/**
 * Require ADMIN, MANAGER, or SUPERVISOR role
 */
export async function requireManagerRole(): Promise<
  AuthSession | NextResponse
> {
  return requireRole(["ADMIN", "MANAGER", "SUPERVISOR"]);
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

