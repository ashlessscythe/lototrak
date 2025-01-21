import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
