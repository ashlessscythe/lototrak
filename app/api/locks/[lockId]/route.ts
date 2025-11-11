import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { requireAuthResponse, requireAdmin } from "@/lib/auth/helpers";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const authResult = await requireAuthResponse();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { lockId } = params;

    const lock = await prisma.lock.findUnique({
      where: {
        id: lockId,
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
    });

    if (!lock) {
      return ApiErrors.notFound("Lock");
    }

    return NextResponse.json(lock);
  } catch (error) {
    return handleApiError(error, "LOCK_GET");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { lockId } = params;
    const body = await req.json();
    const { name, location, status, safetyProcedures } = body;

    if (!name || !location || !status) {
      return ApiErrors.missingFields(["name", "location", "status"]);
    }

    if (!Array.isArray(safetyProcedures)) {
      return ApiErrors.badRequest("Safety procedures must be an array");
    }

    const existingLock = await prisma.lock.findFirst({
      where: {
        id: lockId,
        deleted: false,
      },
    });

    if (!existingLock) {
      return ApiErrors.notFound("Lock");
    }

    const lock = await prisma.lock.update({
      where: { id: lockId },
      data: {
        name,
        location,
        status: status as Status,
        safetyProcedures: safetyProcedures as string[],
      },
    });

    logger.info("Lock updated", { lockId: lock.id, updatedBy: authResult.user.id });
    return NextResponse.json(lock);
  } catch (error) {
    return handleApiError(error, "LOCK_PUT");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { lockId } = params;

    const existingLock = await prisma.lock.findUnique({
      where: { id: lockId },
    });

    if (!existingLock) {
      return ApiErrors.notFound("Lock");
    }

    if (existingLock.status === "IN_USE") {
      return ApiErrors.badRequest("Cannot delete a lock that is currently in use");
    }

    if (existingLock.status === "MAINTENANCE") {
      return ApiErrors.badRequest("Cannot delete a lock that is in maintenance");
    }

    if (existingLock.status === "RETIRED") {
      return ApiErrors.badRequest("Cannot delete a lock that is already retired");
    }

    const [lock] = await prisma.$transaction([
      prisma.lock.update({
        where: { id: lockId },
        data: {
          deleted: true,
          status: "RETIRED",
          userId: null,
        },
      }),
      prisma.event.create({
        data: {
          type: "MAINTENANCE",
          details: "Lock marked as deleted",
          lockName: existingLock.name,
          lockStatus: existingLock.status,
          location: existingLock.location,
          lockId: lockId,
          userId: authResult.user.id,
        },
      }),
    ]);

    logger.info("Lock deleted", { lockId, deletedBy: authResult.user.id });
    return NextResponse.json({
      success: true,
      message: "Lock marked as deleted",
      lock,
    });
  } catch (error) {
    return handleApiError(error, "LOCK_DELETE");
  }
}
