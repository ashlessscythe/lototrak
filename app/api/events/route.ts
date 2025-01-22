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
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lockId = searchParams.get("lockId");
    const limit = parseInt(searchParams.get("limit") || "3");

    if (!lockId) {
      return new NextResponse("Missing lockId parameter", { status: 400 });
    }

    const events = await prisma.event.findMany({
      where: {
        lockId,
        // Don't filter by userId since we want to see all events for the lock
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        details: true,
        location: true,
        lockName: true,
        lockStatus: true,
        safetyChecks: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("[EVENTS_GET] Found events:", events); // Debug log

    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      details,
      location,
      lockName,
      lockStatus,
      lockId,
      safetyChecks,
    } = body;

    // Validate required fields
    if (!type || !details || !location || !lockName || !lockStatus || !lockId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate type is a valid EventType
    if (!Object.values(EventType).includes(type)) {
      return new NextResponse("Invalid event type", { status: 400 });
    }

    // Validate status is a valid Status
    if (!Object.values(Status).includes(lockStatus)) {
      return new NextResponse("Invalid lock status", { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        type,
        details,
        location,
        lockName,
        lockStatus,
        lockId,
        safetyChecks,
        userId: session.user.id,
      },
    });

    console.log("[EVENTS_POST] Created event:", event); // Debug log

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
