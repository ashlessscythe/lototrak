import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Mark route as dynamic
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Allow all authenticated non-pending users
    if (session.user?.role === "PENDING") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get QR code from query parameters
    const { searchParams } = new URL(req.url);
    const qrCode = searchParams.get("code");

    if (!qrCode) {
      return new NextResponse("QR code is required", { status: 400 });
    }

    // Find lock by QR code
    const lock = await prisma.lock.findFirst({
      where: {
        qrCode,
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
    console.error("[LOCK_QR_LOOKUP]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
