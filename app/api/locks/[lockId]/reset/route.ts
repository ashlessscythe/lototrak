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
    });

    if (!lock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    // Reset lock to AVAILABLE state and clear assignment
    const updatedLock = await prisma.lock.update({
      where: { id: lockId },
      data: {
        status: Status.AVAILABLE,
        userId: null,
        location: "N/A",
        safetyProcedures: [],
      },
    });

    // Create reset event
    await prisma.event.create({
      data: {
        type: EventType.MAINTENANCE,
        details: "Lock reset to available state",
        lockId: lockId,
        userId: session.user.id,
        location: lock.location,
        lockName: lock.name,
        lockStatus: Status.AVAILABLE,
      },
    });

    return NextResponse.json(updatedLock);
  } catch (error) {
    console.error("[LOCK_RESET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
