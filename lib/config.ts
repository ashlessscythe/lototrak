export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "LOTO Tracker",
  description: "Modern Safety Protocol Management",
} as const;

export const emailFrom = process.env.EMAIL_FROM_DOMAIN || "resend.dev";
