import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("❌ An admin user already exists");
      process.exit(1);
    }

    // Get admin user details
    const email = await question("Enter admin email: ");
    const password = await question("Enter admin password: ");

    if (!email || !password) {
      console.log("❌ Email and password are required");
      process.exit(1);
    }

    // Create admin user
    const hashedPassword = await hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
        name: "System Administrator",
      },
    });

    console.log("✅ Admin user created successfully");
    console.log({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();
