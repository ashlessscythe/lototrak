import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/helpers";
import { handleApiError } from "@/lib/api/errors";
import { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireRole(["ADMIN", "SUPERVISOR"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        departments: {
          select: {
            assignedAt: true,
            department: {
              select: {
                id: true,
                name: true,
                description: true,
                isDefault: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    isDefault: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error, "USERS_GET");
  }
}
