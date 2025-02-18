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
    const { name, description } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Get default company
    const defaultCompany = await prisma.company.findFirst({
      where: { isDefault: true },
    });

    if (!defaultCompany) {
      return new NextResponse("No default company found", { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        companyId: defaultCompany.id,
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Failed to create department:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
