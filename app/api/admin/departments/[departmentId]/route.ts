import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

// PUT /api/admin/departments/[departmentId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { departmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const department = await prisma.department.update({
      where: { id: params.departmentId },
      data: { name, description },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Failed to update department:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/admin/departments/[departmentId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { departmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if department has any users
    const userCount = await prisma.userDepartment.count({
      where: { departmentId: params.departmentId },
    });

    if (userCount > 0) {
      return new NextResponse("Cannot delete department with assigned users", {
        status: 400,
      });
    }

    await prisma.department.delete({
      where: { id: params.departmentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete department:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
