"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

  const NavigationItems = () => (
    <>
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
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/locks/scan" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Scan Lock
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {isAdminUser && (
            <>
              <NavigationMenuItem>
                <Link href="/admin" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Admin
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/admin/locks" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Locks
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/admin/events" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Events
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </>
          )}
        </>
      )}
    </>
  );

  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">{siteConfig.name}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-3 mt-4">
          <Link href="/" className="text-base font-medium hover:underline">
            Home
          </Link>
          {session && userRole !== "PENDING" && (
            <>
              <Link
                href="/dashboard"
                className="text-base font-medium hover:underline"
              >
                Dashboard
              </Link>
              <Link
                href="/locks/scan"
                className="text-base font-medium hover:underline"
              >
                Scan Lock
              </Link>
              {isAdminUser && (
                <>
                  <Link
                    href="/admin"
                    className="text-base font-medium hover:underline"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/locks"
                    className="text-base font-medium hover:underline"
                  >
                    Locks
                  </Link>
                  <Link
                    href="/admin/events"
                    className="text-base font-medium hover:underline"
                  >
                    Events
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl mx-auto flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <MobileNavigation />
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationItems />
            </NavigationMenuList>
          </NavigationMenu>
          <Link href="/" className="md:hidden font-semibold">
            {siteConfig.name}
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 h-9 px-2 md:h-10 md:px-4"
                >
                  <span className="max-w-[80px] md:max-w-[150px] truncate">
                    {session.user.email}
                  </span>
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
                      <Link href="/locks/scan">Scan Lock</Link>
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
                        <DropdownMenuItem asChild>
                          <Link href="/admin/events">View Events</Link>
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
              <Button
                variant="outline"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild className="h-9 px-3 md:h-10 md:px-4">
                <Link href="/auth/signup">
                  <span className="sm:hidden">Sign Up</span>
                  <span className="hidden sm:inline">Get Started</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
