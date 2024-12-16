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

// Helper to generate a short, readable QR code
const generateQRCode = () => {
  // Generate a 6-character code for better readability
  return nanoid(6);
};

export async function GET() {
  try {
    console.log("GET /api/admin/locks - Fetching session...");
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session) {
      console.log("No session found - Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow ADMIN and SUPERVISOR roles
    if (!["ADMIN", "SUPERVISOR"].includes(session.user?.role)) {
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

    // Only allow ADMIN and SUPERVISOR roles
    if (!["ADMIN", "SUPERVISOR"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    // Only allow ADMIN and SUPERVISOR roles
    if (!["ADMIN", "SUPERVISOR"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    // If QR code is provided, validate its format
    if (qrCode && !isValidQRCode(qrCode)) {
      return new NextResponse(
        "Invalid QR code format. Must be 4-16 alphanumeric characters, underscores, or hyphens.",
        { status: 400 }
      );
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

    // If QR code is being changed, check if it's already in use
    if (qrCode) {
      const existingQRLock = await prisma.lock.findFirst({
        where: {
          qrCode: qrCode,
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
        qrCode: qrCode || undefined, // Only update if provided
        safetyProcedures: safetyProcedures as string[],
      },
    });

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[LOCKS_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
