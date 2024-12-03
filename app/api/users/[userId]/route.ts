import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (
      !session?.user ||
      !["ADMIN", "SUPERVISOR"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { role } = await request.json();

    // Validate role
    if (!["ADMIN", "SUPERVISOR", "USER", "PENDING"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        role: role as Role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
