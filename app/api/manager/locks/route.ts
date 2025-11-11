import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { authOptions } from "@/app/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow ADMIN and MANAGER roles
    if (!["ADMIN", "MANAGER"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const locks = await prisma.lock.findMany({
      where: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(locks);
  } catch (error) {
    console.error("[MANAGER_LOCKS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT endpoint for updating lock details (not creating new ones)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow ADMIN and MANAGER roles
    if (!["ADMIN", "MANAGER"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, name, location, status, safetyProcedures } = body;

    if (!id || !name || !location || !status) {
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
        id,
        deleted: false,
      },
    });

    if (!existingLock) {
      return new NextResponse("Lock not found or has been deleted", {
        status: 404,
      });
    }

    // Update lock details
    const lock = await prisma.lock.update({
      where: { id },
      data: {
        name,
        location,
        status: status as Status,
        safetyProcedures: safetyProcedures as string[],
      },
    });

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[MANAGER_LOCKS_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
