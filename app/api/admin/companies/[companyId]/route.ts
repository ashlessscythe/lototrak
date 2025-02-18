import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

// DELETE /api/admin/companies/[companyId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { companyId } = params;

    // Check if company is default
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    if (company.isDefault) {
      return new NextResponse("Cannot delete default company", { status: 400 });
    }

    // Delete the company
    await prisma.company.delete({
      where: { id: companyId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete company:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
