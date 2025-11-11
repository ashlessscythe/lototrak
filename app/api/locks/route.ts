import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { requireAuthResponse, requireAdminOrManager } from "@/lib/auth/helpers";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { isValidQRCode, generateQRCode } from "@/lib/utils/qr";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireAuthResponse();
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
    return handleApiError(error, "LOCKS_GET");
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireAdminOrManager();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    const { name, location, status, safetyProcedures, qrCode } = body;

    if (!name || !location || !status) {
      return ApiErrors.missingFields(["name", "location", "status"]);
    }

    if (!Array.isArray(safetyProcedures)) {
      return ApiErrors.badRequest("Safety procedures must be an array");
    }

    const finalQrCode = qrCode || generateQRCode();

    if (!isValidQRCode(finalQrCode)) {
      return ApiErrors.invalidFormat(
        "QR code",
        "Must be 4-16 alphanumeric characters, underscores, or hyphens"
      );
    }

    const existingLock = await prisma.lock.findUnique({
      where: { qrCode: finalQrCode },
    });

    if (existingLock) {
      return ApiErrors.badRequest("QR code already in use");
    }

    const lock = await prisma.lock.create({
      data: {
        name,
        location,
        status: status as Status,
        qrCode: finalQrCode,
        safetyProcedures: safetyProcedures as string[],
        deleted: false,
      },
    });

    logger.info("Lock created", {
      lockId: lock.id,
      createdBy: authResult.user.id,
    });
    return NextResponse.json(lock);
  } catch (error) {
    return handleApiError(error, "LOCKS_POST");
  }
}

export async function PUT(req: Request) {
  try {
    const authResult = await requireAdminOrManager();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    const { id, name, location, status, safetyProcedures, qrCode } = body;

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

    const finalQrCode = !qrCode ? generateQRCode() : qrCode;
    const isQrCodeChanging = finalQrCode !== existingLock.qrCode;

    if (isQrCodeChanging) {
      if (!isValidQRCode(finalQrCode)) {
        return ApiErrors.invalidFormat(
          "QR code",
          "Must be 4-16 alphanumeric characters, underscores, or hyphens"
        );
      }

      const existingQRLock = await prisma.lock.findFirst({
        where: {
          qrCode: finalQrCode,
          id: { not: id },
        },
      });

      if (existingQRLock) {
        return ApiErrors.badRequest("QR code already in use");
      }
    }

    const lock = await prisma.lock.update({
      where: { id },
      data: {
        name,
        location,
        status: status as Status,
        qrCode: isQrCodeChanging ? finalQrCode : undefined,
        safetyProcedures: safetyProcedures as string[],
      },
    });

    logger.info("Lock updated", {
      lockId: lock.id,
      updatedBy: authResult.user.id,
    });
    return NextResponse.json(lock);
  } catch (error) {
    return handleApiError(error, "LOCKS_PUT");
  }
}
