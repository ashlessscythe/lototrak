import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, EmailType } from "@/lib/email";
import { siteConfig } from "@/lib/config";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json(
        {
          message: "If an account exists, a password reset email will be sent",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset link
    const resetLink = `${siteConfig.url}/auth/reset-password?token=${resetToken}`;

    // Send reset email
    await sendEmail({
      to: user.email,
      type: EmailType.PASSWORD_RESET,
      data: { resetLink },
    });

    return NextResponse.json(
      { message: "If an account exists, a password reset email will be sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
