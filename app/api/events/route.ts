import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";
import { EventType, Status } from "@prisma/client";

// Mark route as dynamic
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Allow ADMIN, SUPERVISOR, and MANAGER roles to view events
    if (!["ADMIN", "SUPERVISOR", "MANAGER"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const lockId = url.searchParams.get("lockId");
    const type = url.searchParams.get("type") as EventType | null;
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build where clause
    const where = {
      ...(lockId && { lockId }),
      ...(type && { type }),
    };

    // Fetch events with pagination
    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      events,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Allow ADMIN, SUPERVISOR, and MANAGER roles to create events
    if (!["ADMIN", "SUPERVISOR", "MANAGER"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type, details, lockId, lockName, lockStatus, location } = body;

    if (!type || !details) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate event type
    const validTypes = Object.values(EventType);
    if (!validTypes.includes(type)) {
      return new NextResponse(
        `Invalid event type. Must be one of: ${validTypes.join(", ")}`,
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        type,
        details,
        lockId,
        lockName,
        lockStatus,
        location,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
