import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { lockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow ADMIN and SUPERVISOR roles
    if (!["ADMIN", "SUPERVISOR"].includes(session.user?.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lockId } = params;

    await prisma.lock.delete({
      where: { id: lockId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LOCK_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
