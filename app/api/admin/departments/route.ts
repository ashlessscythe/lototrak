import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/departments
export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
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
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    return handleApiError(error, "ADMIN_DEPARTMENTS_GET");
  }
}

// POST /api/admin/departments
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { name, description, companyId } = body;

    if (!name || !companyId) {
      return ApiErrors.missingFields(["name", "companyId"]);
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return ApiErrors.notFound("Company");
    }

    const existingDepartment = await prisma.department.findFirst({
      where: {
        name,
        companyId,
      },
    });

    if (existingDepartment) {
      return ApiErrors.badRequest(
        "Department with this name already exists in the company"
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

    logger.info("Department created", {
      departmentId: department.id,
      createdBy: authResult.user.id,
    });
    return NextResponse.json(department);
  } catch (error) {
    return handleApiError(error, "ADMIN_DEPARTMENTS_POST");
  }
}
