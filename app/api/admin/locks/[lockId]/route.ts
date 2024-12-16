import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";

// Define allowed statuses for deletion
const DELETABLE_STATUSES = ["AVAILABLE", "RETIRED"];

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

    // First fetch the lock to check its status
    const lock = await prisma.lock.findUnique({
      where: { id: lockId },
      select: { status: true, name: true },
    });

    if (!lock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    // Only allow deletion if lock is AVAILABLE or RETIRED
    if (!DELETABLE_STATUSES.includes(lock.status)) {
      return new NextResponse(
        `Cannot delete lock "${
          lock.name
        }" because it is ${lock.status.toLowerCase()}. Only available or retired locks can be deleted.`,
        { status: 400 }
      );
    }

    // If status check passes, proceed with deletion
    await prisma.lock.delete({
      where: { id: lockId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LOCK_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
