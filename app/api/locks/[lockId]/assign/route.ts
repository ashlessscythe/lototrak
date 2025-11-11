import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManagerRole } from "@/lib/auth/helpers";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { isValidQRCode } from "@/lib/utils/qr";
import { EventType, Status } from "@prisma/client";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const authResult = await requireManagerRole();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { lockId } = params;
    const body = await req.json();
    const { safetyChecks } = body;

    if (!Array.isArray(safetyChecks)) {
      return ApiErrors.badRequest("Safety checks must be an array");
    }

    let lock = await prisma.lock.findUnique({
      where: { id: lockId },
      include: {
        assignedTo: true,
      },
    });

    if (!lock && isValidQRCode(lockId)) {
      lock = await prisma.lock.findUnique({
        where: { qrCode: lockId },
        include: {
          assignedTo: true,
        },
      });
    }

    if (!lock) {
      return ApiErrors.notFound("Lock");
    }

    if (
      authResult.user.role === "SUPERVISOR" &&
      lock.status !== "AVAILABLE"
    ) {
      return ApiErrors.forbidden("Supervisors can only assign available locks");
    }

    if (lock.status !== "AVAILABLE") {
      return ApiErrors.badRequest(
        `Lock is not available (current status: ${lock.status})`
      );
    }

    const requiredProcedures = (lock.safetyProcedures as string[]) || [];

    if (requiredProcedures.length === 0) {
      return ApiErrors.badRequest("No safety procedures defined for this lock");
    }

    const missingChecks = requiredProcedures.filter(
      (proc) => !safetyChecks.includes(proc)
    );

    if (missingChecks.length > 0) {
      return ApiErrors.badRequest(
        `Missing safety checks: ${missingChecks.join(", ")}`
      );
    }

    const updatedLock = await prisma.lock.update({
      where: { id: lock.id },
      data: {
        status: Status.IN_USE,
        userId: authResult.user.id,
      },
    });

    await prisma.event.create({
      data: {
        type: EventType.LOCK_ASSIGNED,
        details: "Lock assigned after safety checks",
        safetyChecks: safetyChecks,
        lockId: lock.id,
        userId: authResult.user.id,
        location: lock.location,
        lockName: lock.name,
        lockStatus: Status.IN_USE,
      },
    });

    logger.info("Lock assigned", {
      lockId: lock.id,
      assignedBy: authResult.user.id,
    });
    return NextResponse.json(updatedLock);
  } catch (error) {
    return handleApiError(error, "LOCK_ASSIGN");
  }
}
