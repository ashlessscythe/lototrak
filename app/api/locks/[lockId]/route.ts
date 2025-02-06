import { NextResponse } from "next/server";

// Mark route as dynamic
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { authOptions } from "@/app/auth";

export async function GET(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Allow all authenticated non-pending users to view locks
    if (session.user?.role === "PENDING") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lockId } = params;

    const lock = await prisma.lock.findUnique({
      where: {
        id: lockId,
        deleted: false,
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[LOCK_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only ADMIN can update locks
    if (session.user?.role !== "ADMIN") {
      return new NextResponse("Only administrators can update locks", {
        status: 403,
      });
    }

    const { lockId } = params;
    const body = await req.json();
    const { name, location, status, safetyProcedures } = body;

    if (!name || !location || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate safety procedures
    if (!Array.isArray(safetyProcedures)) {
      return new NextResponse("Safety procedures must be an array", {
        status: 400,
      });
    }

    // Check if lock exists and is not deleted
    const existingLock = await prisma.lock.findFirst({
      where: {
        id: lockId,
        deleted: false,
      },
    });

    if (!existingLock) {
      return new NextResponse("Lock not found or has been deleted", {
        status: 404,
      });
    }

    const lock = await prisma.lock.update({
      where: { id: lockId },
      data: {
        name,
        location,
        status: status as Status,
        safetyProcedures: safetyProcedures as string[],
      },
    });

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[LOCK_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only ADMIN can delete locks
    if (session.user?.role !== "ADMIN") {
      return new NextResponse("Only administrators can delete locks", {
        status: 403,
      });
    }

    const { lockId } = params;

    // First get the lock to access its location
    const existingLock = await prisma.lock.findUnique({
      where: { id: lockId },
    });

    if (!existingLock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    // Check if lock can be deleted
    if (existingLock.status === "IN_USE") {
      return new NextResponse("Cannot delete a lock that is currently in use", {
        status: 400,
      });
    }

    if (existingLock.status === "MAINTENANCE") {
      return new NextResponse("Cannot delete a lock that is in maintenance", {
        status: 400,
      });
    }

    if (existingLock.status === "RETIRED") {
      return new NextResponse("Cannot delete a lock that is already retired", {
        status: 400,
      });
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
          lockName: existingLock.name,
          lockStatus: existingLock.status,
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
