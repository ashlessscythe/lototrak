import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { nanoid } from "nanoid";
import { authOptions } from "@/app/auth";

// Helper to validate QR code format
const isValidQRCode = (code: string) => {
  // QR code should be alphanumeric and reasonable length (4-16 chars for better readability)
  return /^[a-zA-Z0-9_-]{4,16}$/.test(code);
};

// Helper to generate a QR code
const generateQRCode = (length: number = 14) => {
  return nanoid(length);
};

export async function GET() {
  try {
    console.log("GET /api/locks - Fetching session...");
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session) {
      console.log("No session found - Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Allow all authenticated users to view locks
    if (session.user?.role === "PENDING") {
      console.log("Invalid role:", session.user?.role);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Fetching locks from database...");
    const locks = await prisma.lock.findMany({
      where: {
        deleted: false, // Only fetch non-deleted locks
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
    console.log("Fetched locks:", locks);

    return NextResponse.json(locks);
  } catch (error) {
    console.error("[LOCKS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only ADMIN and MANAGER can create new locks
    if (!["ADMIN", "MANAGER"].includes(session.user?.role || "")) {
      return new NextResponse(
        "Only administrators and managers can create locks",
        {
          status: 403,
        }
      );
    }

    const body = await req.json();
    const { name, location, status, safetyProcedures, qrCode } = body;

    if (!name || !location || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate safety procedures
    if (!Array.isArray(safetyProcedures)) {
      return new NextResponse("Safety procedures must be an array", {
        status: 400,
      });
    }

    // Generate QR code if not provided, or validate provided one
    const finalQrCode = qrCode || generateQRCode();

    // Validate QR code format
    if (!isValidQRCode(finalQrCode)) {
      return new NextResponse(
        "Invalid QR code format. Must be 4-16 alphanumeric characters, underscores, or hyphens.",
        { status: 400 }
      );
    }

    // Check if QR code is already in use (including deleted locks)
    const existingLock = await prisma.lock.findUnique({
      where: { qrCode: finalQrCode },
    });

    if (existingLock) {
      return new NextResponse("QR code already in use", { status: 400 });
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

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[LOCKS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only ADMIN and MANAGER can update locks
    if (!["ADMIN", "MANAGER"].includes(session.user?.role || "")) {
      return new NextResponse(
        "Only administrators and managers can update locks",
        {
          status: 403,
        }
      );
    }

    const body = await req.json();
    const { id, name, location, status, safetyProcedures, qrCode } = body;

    if (!id || !name || !location || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate safety procedures
    if (!Array.isArray(safetyProcedures)) {
      return new NextResponse("Safety procedures must be an array", {
        status: 400,
      });
    }

    // Check if lock exists and is not deleted
    const existingLock = await prisma.lock.findFirst({
      where: {
        id,
        deleted: false,
      },
    });

    if (!existingLock) {
      return new NextResponse("Lock not found or has been deleted", {
        status: 404,
      });
    }

    // Generate new QR code if empty, or validate provided one
    const finalQrCode = !qrCode ? generateQRCode() : qrCode;
    const isQrCodeChanging = finalQrCode !== existingLock.qrCode;

    if (isQrCodeChanging) {
      // Validate new QR code format
      if (!isValidQRCode(finalQrCode)) {
        return new NextResponse(
          "Invalid QR code format. Must be 4-16 alphanumeric characters, underscores, or hyphens.",
          { status: 400 }
        );
      }

      // Check if new QR code is already in use
      const existingQRLock = await prisma.lock.findFirst({
        where: {
          qrCode: finalQrCode,
          id: { not: id },
        },
      });

      if (existingQRLock) {
        return new NextResponse("QR code already in use", { status: 400 });
      }
    }

    const lock = await prisma.lock.update({
      where: { id },
      data: {
        name,
        location,
        status: status as Status,
        qrCode: isQrCodeChanging ? finalQrCode : undefined, // Only update if changed
        safetyProcedures: safetyProcedures as string[],
      },
    });

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[LOCKS_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
