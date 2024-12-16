import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow ADMIN and SUPERVISOR roles
    if (!["ADMIN", "SUPERVISOR"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lockId } = params;

    // First get the lock to access its location
    const existingLock = await prisma.lock.findUnique({
      where: { id: lockId },
    });

    if (!existingLock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    // Then mark as deleted and create an event
    const [lock, event] = await prisma.$transaction([
      prisma.lock.update({
        where: { id: lockId },
        data: {
          deleted: true,
          status: "RETIRED", // Also set status to RETIRED
          userId: null, // Remove any assignment
        },
      }),
      prisma.event.create({
        data: {
          type: "MAINTENANCE",
          details: "Lock marked as deleted",
          location: existingLock.location,
          lockId: lockId,
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Lock marked as deleted",
      lock,
    });
  } catch (error) {
    console.error("[LOCK_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
