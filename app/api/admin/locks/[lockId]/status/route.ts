import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { authOptions } from "@/app/auth";
import { Prisma } from "@prisma/client";

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

    // Validate status is a valid enum value
    const validStatuses = ["AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED"];
    if (!validStatuses.includes(status)) {
      return new NextResponse(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        {
          status: 400,
        }
      );
    }

    // First check if lock exists
    const existingLock = await prisma.lock.findUnique({
      where: { id: lockId },
    });

    if (!existingLock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    console.log("Updating lock status:", { lockId, status });

    // Use a transaction to ensure both operations succeed or fail together
    const [lock, event] = await prisma.$transaction([
      prisma.lock.update({
        where: { id: lockId },
        data: { status: status as Status },
      }),
      prisma.event.create({
        data: {
          type: "STATUS_CHANGED",
          details: `Status changed from ${existingLock.status} to ${status} at location: ${existingLock.location}`,
          lockId,
          userId: session.user.id,
        },
      }),
    ]);

    console.log("Updated lock:", lock);
    console.log("Created event:", event);

    return NextResponse.json({
      success: true,
      lock,
      event,
    });
  } catch (error) {
    console.error("[LOCK_STATUS_UPDATE]", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return new NextResponse("Lock not found", { status: 404 });
      }
      return new NextResponse(`Database error: ${error.message}`, {
        status: 400,
      });
    }

    return new NextResponse("Internal server error", { status: 500 });
  }
}
