import { Role } from "@/lib/types";

export interface NavigationItem {
  label: string;
  href: string;
  roles?: Role[];
  requiresAuth?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    requiresAuth: false,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    requiresAuth: true,
    roles: ["ADMIN", "MANAGER", "SUPERVISOR", "USER"],
  },
  {
    label: "Locks",
    href: "/locks",
    requiresAuth: true,
    roles: ["ADMIN", "MANAGER", "SUPERVISOR", "USER"],
  },
  {
    label: "Scan Lock",
    href: "/locks/scan",
    requiresAuth: true,
    roles: ["ADMIN", "MANAGER", "SUPERVISOR", "USER"],
  },
  {
    label: "Events",
    href: "/events",
    requiresAuth: true,
    roles: ["ADMIN", "SUPERVISOR", "MANAGER"],
  },
  {
    label: "Admin",
    href: "/admin",
    requiresAuth: true,
    roles: ["ADMIN"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    requiresAuth: true,
    roles: ["ADMIN"],
  },
];

/**
 * Get navigation items visible to a user based on their role
 */
export function getVisibleNavigationItems(userRole?: Role | null): NavigationItem[] {
  if (!userRole || userRole === "PENDING") {
    return navigationItems.filter((item) => !item.requiresAuth);
  }

  return navigationItems.filter((item) => {
    if (!item.requiresAuth) return true;
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });
}

