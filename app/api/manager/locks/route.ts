import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { requireAdminOrManager } from "@/lib/auth/helpers";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireAdminOrManager();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const locks = await prisma.lock.findMany({
      where: {
        deleted: false,
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(locks);
  } catch (error) {
    return handleApiError(error, "MANAGER_LOCKS_GET");
  }
}

// PUT endpoint for updating lock details (not creating new ones)
export async function PUT(req: Request) {
  try {
    const authResult = await requireAdminOrManager();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    const { id, name, location, status, safetyProcedures } = body;

    if (!id || !name || !location || !status) {
      return ApiErrors.missingFields(["id", "name", "location", "status"]);
    }

    if (!Array.isArray(safetyProcedures)) {
      return ApiErrors.badRequest("Safety procedures must be an array");
    }

    const existingLock = await prisma.lock.findFirst({
      where: {
        id,
        deleted: false,
      },
    });

    if (!existingLock) {
      return ApiErrors.notFound("Lock");
    }

    const lock = await prisma.lock.update({
      where: { id },
      data: {
        name,
        location,
        status: status as Status,
        safetyProcedures: safetyProcedures as string[],
      },
    });

    logger.info("Lock updated via manager route", {
      lockId: lock.id,
      updatedBy: authResult.user.id,
    });
    return NextResponse.json(lock);
  } catch (error) {
    return handleApiError(error, "MANAGER_LOCKS_PUT");
  }
}
