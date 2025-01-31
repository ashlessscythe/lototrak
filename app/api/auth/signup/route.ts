import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user with PENDING role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "PENDING" as Role,
      },
    });

    // Send welcome email
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue with signup response even if email fails
    }

    return NextResponse.json(
      {
        message: "User created successfully. Your account is pending approval.",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
