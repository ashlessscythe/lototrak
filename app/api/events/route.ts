import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManagerRole } from "@/lib/auth/helpers";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { EventType } from "@prisma/client";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authResult = await requireManagerRole();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const url = new URL(req.url);
    const lockId = url.searchParams.get("lockId");
    const type = url.searchParams.get("type") as EventType | null;
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const where = {
      ...(lockId && { lockId }),
      ...(type && { type }),
    };

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
    return handleApiError(error, "EVENTS_GET");
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireManagerRole();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    const { type, details, lockId, lockName, lockStatus, location } = body;

    if (!type || !details) {
      return ApiErrors.missingFields(["type", "details"]);
    }

    const validTypes = Object.values(EventType);
    if (!validTypes.includes(type)) {
      return ApiErrors.invalidFormat(
        "event type",
        `Must be one of: ${validTypes.join(", ")}`
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
        userId: authResult.user.id,
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

    logger.info("Event created", { eventId: event.id, createdBy: authResult.user.id });
    return NextResponse.json(event);
  } catch (error) {
    return handleApiError(error, "EVENTS_POST");
  }
}
