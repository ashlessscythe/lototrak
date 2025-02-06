import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = "ADMIN" | "MANAGER" | "SUPERVISOR" | "USER" | "PENDING";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isHomePage = request.nextUrl.pathname === "/";
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isEventsPage = request.nextUrl.pathname.startsWith("/admin/events");

  // Allow public access to home page
  if (isHomePage) {
    return NextResponse.next();
  }

  // Handle auth pages (signin, signup, error)
  if (isAuthPage) {
    if (token) {
      // If user is PENDING, only allow access to pending page
      if (
        (token.role as Role) === "PENDING" &&
        request.nextUrl.pathname !== "/auth/pending"
      ) {
        return NextResponse.redirect(new URL("/auth/pending", request.url));
      }
      // If user is approved, redirect to dashboard
      if (
        (token.role as Role) !== "PENDING" &&
        request.nextUrl.pathname !== "/auth/signout"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (isDashboardPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    // Redirect PENDING users to pending page
    if ((token.role as Role) === "PENDING") {
      return NextResponse.redirect(new URL("/auth/pending", request.url));
    }
    return NextResponse.next();
  }

  // Protect events routes - allow ADMIN, SUPERVISOR, and MANAGER roles
  if (isEventsPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    if (!["ADMIN", "SUPERVISOR", "MANAGER"].includes(token.role as Role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes - only allow ADMIN role
  if (isAdminPage && !isEventsPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    if ((token.role as Role) !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Default protection for other routes
  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
