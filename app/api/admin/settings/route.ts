import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/settings
export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const settings = await prisma.systemSettings.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (error) {
    return handleApiError(error, "ADMIN_SETTINGS_GET");
  }
}

// POST /api/admin/settings
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { key, value } = await request.json();

    if (!key || typeof value === "undefined") {
      return ApiErrors.missingFields(["key", "value"]);
    }

    await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    logger.info("System setting updated", { key, updatedBy: authResult.user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "ADMIN_SETTINGS_POST");
  }
}
