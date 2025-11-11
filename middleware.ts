import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getUserRole,
  hasRequiredRole,
  getRouteProtection,
  handleAuthPageRedirect,
} from "@/lib/auth/middleware-helpers";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userRole = await getUserRole(request);
  const protection = getRouteProtection(pathname);

  // Handle public routes
  if (!protection.requiresAuth) {
    // Handle auth page redirects for logged-in users
    if (pathname.startsWith("/auth") && userRole) {
      const redirect = handleAuthPageRedirect(request, userRole);
      if (redirect) return redirect;
    }
    return NextResponse.next();
  }

  // Require authentication
  if (!userRole) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check role requirements
  if (protection.allowedRoles) {
    if (!hasRequiredRole(userRole, protection.allowedRoles)) {
      const redirectTo = protection.redirectTo || "/dashboard";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // Handle PENDING users
  if (userRole === "PENDING") {
    const redirectTo = protection.redirectTo || "/auth/pending";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
