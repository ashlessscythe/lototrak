import { NextResponse } from "next/server";

// Mark route as dynamic
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";
import { EventType, Status } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role === "PENDING") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only ADMIN, MANAGER, and SUPERVISOR can release locks
    if (!["ADMIN", "MANAGER", "SUPERVISOR"].includes(session.user.role)) {
      return new NextResponse("Insufficient permissions", { status: 403 });
    }

    const { lockId } = params;

    // Get the lock and verify it exists
    const lock = await prisma.lock.findUnique({
      where: { id: lockId },
      include: {
        assignedTo: true,
      },
    });

    if (!lock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    // Verify lock is in use
    if (lock.status !== "IN_USE") {
      return new NextResponse("Lock is not in use", { status: 400 });
    }

    // For supervisors, verify they own the lock or it's assigned to their user
    if (session.user.role === "SUPERVISOR") {
      if (lock.userId !== session.user.id) {
        return new NextResponse(
          "Supervisors can only release locks assigned to them",
          { status: 403 }
        );
      }
    }

    // Update lock status and remove assignment
    const updatedLock = await prisma.lock.update({
      where: { id: lockId },
      data: {
        status: Status.AVAILABLE,
        userId: null,
      },
    });

    // Create release event with lock information
    await prisma.event.create({
      data: {
        type: EventType.LOCK_RELEASED,
        details: "Lock released",
        lockId: lockId,
        userId: session.user.id,
        location: lock.location,
        lockName: lock.name,
        lockStatus: Status.AVAILABLE, // Store the new status
      },
    });

    return NextResponse.json(updatedLock);
  } catch (error) {
    console.error("[LOCK_RELEASE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
