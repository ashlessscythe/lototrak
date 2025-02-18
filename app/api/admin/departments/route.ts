import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

// GET /api/admin/departments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/admin/departments
export async function POST(request: NextRequest) {
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

    // Check if department name already exists in company
    const existingDepartment = await prisma.department.findFirst({
      where: {
        name,
        companyId,
      },
    });

    if (existingDepartment) {
      return new NextResponse(
        "Department with this name already exists in the company",
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
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
    console.error("Failed to create department:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
