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
    const { name, description, companyId } = body;

    if (!name || !companyId) {
      return new NextResponse("Name and company are required", { status: 400 });
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    // Check if department name already exists in the company (excluding current department)
    const existingDepartment = await prisma.department.findFirst({
      where: {
        name,
        companyId,
        NOT: {
          id: params.departmentId,
        },
      },
    });

    if (existingDepartment) {
      return new NextResponse(
        "Department with this name already exists in the company",
        { status: 400 }
      );
    }

    const department = await prisma.department.update({
      where: { id: params.departmentId },
      data: {
        name,
        description,
        companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

    // Check if department exists and is not default
    const department = await prisma.department.findUnique({
      where: { id: params.departmentId },
    });

    if (!department) {
      return new NextResponse("Department not found", { status: 404 });
    }

    if (department.isDefault) {
      return new NextResponse("Cannot delete default department", {
        status: 400,
      });
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
