import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { sendEmail, EmailType } from "@/lib/email";

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
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get current user role
    const currentUser = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        email: true,
        role: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    // Send email if user was pending and is now approved
    if (currentUser.role === "PENDING" && role !== "PENDING") {
      await sendEmail({
        to: currentUser.email,
        type: EmailType.ROLE_CHANGE,
        data: {
          newRole: role,
        },
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
