import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { ApiErrors, handleApiError } from "@/lib/api/errors";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/companies
export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(companies);
  } catch (error) {
    return handleApiError(error, "ADMIN_COMPANIES_GET");
  }
}

// POST /api/admin/companies
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return ApiErrors.missingFields(["name"]);
    }

    const company = await prisma.company.create({
      data: {
        name,
        description: description || null,
      },
    });

    logger.info("Company created", {
      companyId: company.id,
      createdBy: authResult.user.id,
    });
    return NextResponse.json(company);
  } catch (error: any) {
    if (error.code === "P2002") {
      return ApiErrors.badRequest("Company name already exists");
    }
    return handleApiError(error, "ADMIN_COMPANIES_POST");
  }
}

// PUT /api/admin/companies
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return ApiErrors.missingFields(["id", "name"]);
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    });

    logger.info("Company updated", {
      companyId: company.id,
      updatedBy: authResult.user.id,
    });
    return NextResponse.json(company);
  } catch (error: any) {
    if (error.code === "P2002") {
      return ApiErrors.badRequest("Company name already exists");
    }
    if (error.code === "P2025") {
      return ApiErrors.notFound("Company");
    }
    return handleApiError(error, "ADMIN_COMPANIES_PUT");
  }
}
