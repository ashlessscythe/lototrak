import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@/lib/types";

export interface RouteProtection {
  requiresAuth: boolean;
  allowedRoles?: Role[];
  redirectTo?: string;
}

/**
 * Get user role from token
 */
export async function getUserRole(
  request: NextRequest
): Promise<Role | null> {
  const token = await getToken({ req: request });
  return (token?.role as Role) || null;
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: Role | null, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Check if route requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const publicRoutes = ["/", "/contributing", "/faq", "/guide"];
  return !publicRoutes.includes(pathname) && !pathname.startsWith("/auth");
}

/**
 * Get route protection rules
 */
export function getRouteProtection(pathname: string): RouteProtection {
  // Public routes
  if (pathname === "/") {
    return { requiresAuth: false };
  }

  // Auth pages
  if (pathname.startsWith("/auth")) {
    return { requiresAuth: false };
  }

  // Dashboard routes
  if (pathname.startsWith("/dashboard")) {
    return {
      requiresAuth: true,
      allowedRoles: ["ADMIN", "MANAGER", "SUPERVISOR", "USER"],
      redirectTo: "/auth/pending",
    };
  }

  // Events routes
  if (pathname.startsWith("/events")) {
    return {
      requiresAuth: true,
      allowedRoles: ["ADMIN", "SUPERVISOR", "MANAGER"],
      redirectTo: "/dashboard",
    };
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    return {
      requiresAuth: true,
      allowedRoles: ["ADMIN"],
      redirectTo: "/dashboard",
    };
  }

  // Locks routes
  if (pathname.startsWith("/locks")) {
    return {
      requiresAuth: true,
      allowedRoles: ["ADMIN", "MANAGER", "SUPERVISOR", "USER"],
      redirectTo: "/auth/pending",
    };
  }

  // Profile routes
  if (pathname.startsWith("/profile")) {
    return {
      requiresAuth: true,
      allowedRoles: ["ADMIN", "MANAGER", "SUPERVISOR", "USER"],
      redirectTo: "/auth/pending",
    };
  }

  // Default: require auth
  return {
    requiresAuth: true,
    redirectTo: "/auth/signin",
  };
}

/**
 * Handle auth page redirects
 */
export function handleAuthPageRedirect(
  request: NextRequest,
  userRole: Role | null
): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  if (!userRole) {
    return null; // Allow access to auth pages if not logged in
  }

  // PENDING users can only access pending page
  if (userRole === "PENDING" && pathname !== "/auth/pending") {
    return NextResponse.redirect(new URL("/auth/pending", request.url));
  }

  // Authenticated users should be redirected away from auth pages (except signout)
  if (userRole !== "PENDING" && pathname !== "/auth/signout") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return null;
}

