import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to get absolute URL for API calls
function getApiUrl(path: string) {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  // Server-side, use environment variable or default
  return `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }${path}`;
}

// Get system settings from API
export async function getSystemSettings() {
  try {
    const response = await fetch(getApiUrl("/api/settings"));
    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {}; // Return empty object as fallback
  }
}

// Format a date using the system timezone
export function formatDateWithSettings(
  date: Date | string,
  settings: Record<string, string>,
  format: Intl.DateTimeFormatOptions = {}
) {
  const timezone =
    settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const defaultFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: timezone,
    ...format,
  };

  return new Intl.DateTimeFormat("en-US", defaultFormat).format(new Date(date));
}

// Format a date relative to now (e.g. "2 hours ago")
export function formatRelativeTimeWithSettings(
  date: Date | string,
  settings: Record<string, string>
) {
  const timezone =
    settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = new Date();
  const then = new Date(date);

  // Convert both dates to the system timezone
  const nowTz = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const thenTz = new Date(then.toLocaleString("en-US", { timeZone: timezone }));

  const diffInSeconds = Math.floor((nowTz.getTime() - thenTz.getTime()) / 1000);

  if (diffInSeconds < 60) return formatter.format(-diffInSeconds, "seconds");
  if (diffInSeconds < 3600)
    return formatter.format(-Math.floor(diffInSeconds / 60), "minutes");
  if (diffInSeconds < 86400)
    return formatter.format(-Math.floor(diffInSeconds / 3600), "hours");
  if (diffInSeconds < 2592000)
    return formatter.format(-Math.floor(diffInSeconds / 86400), "days");
  if (diffInSeconds < 31536000)
    return formatter.format(-Math.floor(diffInSeconds / 2592000), "months");
  return formatter.format(-Math.floor(diffInSeconds / 31536000), "years");
}
