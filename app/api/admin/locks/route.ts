import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";
import { nanoid } from "nanoid";
import { authOptions } from "@/app/auth";

export async function GET() {
  try {
    console.log("GET /api/admin/locks - Fetching session...");
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

    console.log("Fetching locks from database...");
    const locks = await prisma.lock.findMany({
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
    console.log("Fetched locks:", locks);

    return NextResponse.json(locks);
  } catch (error) {
    console.error("[LOCKS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow ADMIN and SUPERVISOR roles
    if (!["ADMIN", "SUPERVISOR"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, location, status } = body;

    if (!name || !location || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate a unique QR code
    const qrCode = nanoid();

    const lock = await prisma.lock.create({
      data: {
        name,
        location,
        status: status as Status,
        qrCode,
      },
    });

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[LOCKS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow ADMIN and SUPERVISOR roles
    if (!["ADMIN", "SUPERVISOR"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, name, location, status } = body;

    if (!id || !name || !location || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lock = await prisma.lock.update({
      where: { id },
      data: {
        name,
        location,
        status: status as Status,
      },
    });

    return NextResponse.json(lock);
  } catch (error) {
    console.error("[LOCKS_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
