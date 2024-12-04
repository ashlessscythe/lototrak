import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";

export async function GET(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lockId } = params;

    // Try to find the lock by ID first
    const lock = await prisma.lock.findUnique({
      where: { id: lockId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lock) {
      // If not found by ID, try to find by QR code
      const lockByQR = await prisma.lock.findUnique({
        where: { qrCode: lockId },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!lockByQR) {
        console.error(`Lock not found with ID or QR code: ${lockId}`);
        return new NextResponse("Lock not found", { status: 404 });
      }

      return NextResponse.json({
        ...lockByQR,
        safetyProcedures: lockByQR.safetyProcedures || [],
      });
    }

    // Ensure safetyProcedures is always an array
    return NextResponse.json({
      ...lock,
      safetyProcedures: lock.safetyProcedures || [],
    });
  } catch (error) {
    console.error("[LOCK_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
