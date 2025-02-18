import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

// GET /api/admin/companies
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/admin/companies
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

    const company = await prisma.company.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(company);
  } catch (error: any) {
    if (error.code === "P2002") {
      return new NextResponse("Company name already exists", { status: 400 });
    }
    console.error("Failed to create company:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/admin/companies
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return new NextResponse("ID and name are required", { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(company);
  } catch (error: any) {
    if (error.code === "P2002") {
      return new NextResponse("Company name already exists", { status: 400 });
    }
    if (error.code === "P2025") {
      return new NextResponse("Company not found", { status: 404 });
    }
    console.error("Failed to update company:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
