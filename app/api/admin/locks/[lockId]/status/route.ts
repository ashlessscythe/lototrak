import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { authOptions } from "@/app/auth";

export async function PUT(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    console.log("PUT /api/admin/locks/[lockId]/status - Fetching session...");
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

    const { lockId } = params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return new NextResponse("Missing status field", { status: 400 });
    }

    console.log("Updating lock status:", { lockId, status });
    const lock = await prisma.lock.update({
      where: { id: lockId },
      data: { status: status as Status },
    });
    console.log("Updated lock:", lock);

    // Create an event for the status change
    const event = await prisma.event.create({
      data: {
        type: "STATUS_CHANGED",
        details: `Status changed to ${status}`,
        lockId,
        userId: session.user.id, // Now we can safely use the ID from the session
      },
    });
    console.log("Created event:", event);

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[LOCK_STATUS_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
