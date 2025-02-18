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

    const { role, departmentId, action } = await request.json();

    // Validate role if provided
    if (role && !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate department if provided
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      }
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

    // Prepare update data
    const updateData: any = {};
    if (role) {
      updateData.role = role as Role;
    }

    // Start transaction to handle both role and department updates
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user role if provided
      const user = await tx.user.update({
        where: { id: params.userId },
        data: updateData,
        include: {
          departments: {
            include: {
              department: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      // Handle department assignment/removal if provided
      if (departmentId) {
        if (action === "add") {
          // Check if already assigned
          const existing = await tx.userDepartment.findUnique({
            where: {
              userId_departmentId: {
                userId: params.userId,
                departmentId,
              },
            },
          });

          if (!existing) {
            await tx.userDepartment.create({
              data: {
                userId: params.userId,
                departmentId,
              },
            });
          }
        } else if (action === "remove") {
          await tx.userDepartment.delete({
            where: {
              userId_departmentId: {
                userId: params.userId,
                departmentId,
              },
            },
          });
        }
      }

      return user;
    });

    // Send email if role was changed from pending to something else
    if (role && currentUser.role === "PENDING" && role !== "PENDING") {
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
