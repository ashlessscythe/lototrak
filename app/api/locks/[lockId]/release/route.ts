import { NextResponse } from "next/server";
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
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    // Verify lock is in use and assigned to the requesting user
    if (lock.status !== "IN_USE") {
      return new NextResponse("Lock is not in use", { status: 400 });
    }

    if (lock.userId !== session.user.id) {
      return new NextResponse("Lock is not assigned to you", { status: 403 });
    }

    // Update lock status and remove assignment
    const updatedLock = await prisma.lock.update({
      where: { id: lockId },
      data: {
        status: Status.AVAILABLE,
        userId: null,
      },
    });

    // Create release event
    await prisma.event.create({
      data: {
        type: EventType.LOCK_RELEASED,
        details: "Lock released",
        lockId: lockId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(updatedLock);
  } catch (error) {
    console.error("[LOCK_RELEASE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
