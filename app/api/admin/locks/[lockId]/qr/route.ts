import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { authOptions } from "@/app/auth";

export async function GET(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    console.log("GET /api/admin/locks/[lockId]/qr - Fetching session...");
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

    console.log("Fetching lock:", lockId);
    const lock = await prisma.lock.findUnique({
      where: { id: lockId },
    });
    console.log("Found lock:", lock);

    if (!lock) {
      return new NextResponse("Lock not found", { status: 404 });
    }

    // Generate QR code as a PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(lock.qrCode, {
      type: "png",
      width: 300,
      margin: 1,
      errorCorrectionLevel: "H",
    });

    // Return QR code as a PNG image
    return new NextResponse(qrCodeBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="lock-${lockId}-qr.png"`,
      },
    });
  } catch (error) {
    console.error("[LOCK_QR_CODE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
