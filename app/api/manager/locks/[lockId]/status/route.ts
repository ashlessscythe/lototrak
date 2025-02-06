import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";
import { EventType, Status } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role === 'PENDING') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only ADMIN and MANAGER can change to MAINTENANCE or RETIRED status
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Only administrators and managers can change maintenance status", { status: 403 });
    }

    const { lockId } = params;
    const body = await req.json();
    const { status, reason } = body;

    // Validate status is one that managers can set
    if (!["MAINTENANCE", "RETIRED"].includes(status)) {
      return new NextResponse("Managers can only set MAINTENANCE or RETIRED status", { status: 400 });
    }

    if (!reason) {
      return new NextResponse("Reason is required for status change", { status: 400 });
    }

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

    // Cannot change status if lock is in use
    if (lock.status === "IN_USE") {
      return new NextResponse("Cannot change status of lock that is in use", { status: 400 });
    }

    // Update lock status
    const updatedLock = await prisma.lock.update({
      where: { id: lockId },
      data: {
        status: status as Status,
        userId: null, // Remove any assignment when going to maintenance/retired
      },
    });

    // Create status change event
    await prisma.event.create({
      data: {
        type: EventType.STATUS_CHANGED,
        details: `Status changed to ${status}: ${reason}`,
        lockId: lockId,
        userId: session.user.id,
        location: lock.location,
        lockName: lock.name,
        lockStatus: status as Status,
      },
    });

    return NextResponse.json(updatedLock);
  } catch (error) {
    console.error("[MANAGER_STATUS_CHANGE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
