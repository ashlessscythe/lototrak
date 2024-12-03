"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/config";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Role } from "@/lib/types";

export function SiteHeader() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role | undefined;

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

  const isAdminUser = userRole && ["ADMIN", "SUPERVISOR"].includes(userRole);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {siteConfig.name}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {session && userRole !== "PENDING" && (
              <>
                <NavigationMenuItem>
                  <Link href="/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                {isAdminUser && (
                  <>
                    <NavigationMenuItem>
                      <Link href="/admin" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          Admin
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/admin/locks" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          Locks
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </>
                )}
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {session.user.email}
                  {userRole && (
                    <span className={`text-xs ${getRoleColor(userRole)}`}>
                      ({userRole})
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 text-foreground bg-background border border-border rounded-md shadow-sm"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole !== "PENDING" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    {isAdminUser && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users">Manage Users</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/locks">Manage Locks</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
