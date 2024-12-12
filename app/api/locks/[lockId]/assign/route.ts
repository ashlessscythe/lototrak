import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";
import { EventType, Status } from "@prisma/client";

// Helper to validate QR code format
const isValidQRCode = (code: string) => {
  // QR code should be alphanumeric and reasonable length
  return /^[a-zA-Z0-9_-]{4,32}$/.test(code);
};

export async function POST(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lockId } = params;
    const body = await req.json();
    const { safetyChecks } = body;

    if (!Array.isArray(safetyChecks)) {
      return new NextResponse("Safety checks must be an array", {
        status: 400,
      });
    }

    // Try to find the lock by ID first
    let lock = await prisma.lock.findUnique({
      where: { id: lockId },
      include: {
        assignedTo: true,
      },
    });

    // If not found by ID and looks like a QR code, try QR code lookup
    if (!lock && isValidQRCode(lockId)) {
      lock = await prisma.lock.findUnique({
        where: { qrCode: lockId },
        include: {
          assignedTo: true,
        },
      });
    }

    if (!lock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    // Verify lock is available
    if (lock.status !== "AVAILABLE") {
      return new NextResponse(
        `Lock is not available (current status: ${lock.status})`,
        { status: 400 }
      );
    }

    // Verify all required safety procedures are checked
    const requiredProcedures = (lock.safetyProcedures as string[]) || [];

    if (requiredProcedures.length === 0) {
      return new NextResponse("No safety procedures defined for this lock", {
        status: 400,
      });
    }

    const missingChecks = requiredProcedures.filter(
      (proc) => !safetyChecks.includes(proc)
    );

    if (missingChecks.length > 0) {
      return new NextResponse(
        `Missing safety checks: ${missingChecks.join(", ")}`,
        { status: 400 }
      );
    }

    // Update lock status and assign to user
    const updatedLock = await prisma.lock.update({
      where: { id: lock.id },
      data: {
        status: Status.IN_USE,
        userId: session.user.id,
      },
    });

    // Create assignment event with safety checks
    await prisma.event.create({
      data: {
        type: EventType.LOCK_ASSIGNED,
        details: "Lock assigned after safety checks",
        safetyChecks: safetyChecks,
        lockId: lock.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(updatedLock);
  } catch (error) {
    console.error("[LOCK_ASSIGN]", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return new NextResponse(message, { status: 500 });
  }
}
