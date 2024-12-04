import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/auth";

// Mark route as dynamic
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const locks = await prisma.lock.findMany({
      where: {
        userId: session.user.id,
        status: "IN_USE",
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(locks);
  } catch (error) {
    console.error("[ASSIGNED_LOCKS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
