import { PrismaClient, Role, Status, EventType } from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Helper to generate a QR code
const generateQRCode = (length: number = 14) => {
  return nanoid(length);
};

const prisma = new PrismaClient();

// Common warehouse safety procedures
const safetyProceduresList = [
  "Wear safety vest at all times",
  "Check surroundings before operating equipment",
  "Maintain 3 points of contact on ladders",
  "Keep fire exits clear",
  "Report any spills immediately",
  "Use proper lifting techniques",
  "Wear steel-toed boots",
  "Follow lockout/tagout procedures",
  "Keep aisles clear of obstructions",
  "Use handrails on stairs",
  "Inspect equipment before use",
  "Maintain safe distance from moving vehicles",
  "Use proper PPE when handling chemicals",
  "Report any safety concerns to supervisor",
  "Follow speed limit guidelines",
];

async function createLockWithEvents(userId: string) {
  const warehouseLocations = [
    "Staging Lane",
    "Building",
    "Dock Door",
    "Warehouse Area",
  ];

  // Generate a random warehouse-oriented location
  const generateLocation = () => {
    const prefixOrSuffix = faker.datatype.boolean(); // Randomly decide if number comes before or after
    const location = faker.helpers.arrayElement(warehouseLocations);
    const randomNum = faker.number.int({ min: 1, max: 50 }); // Adjust range as needed

    return prefixOrSuffix
      ? `${location} ${randomNum}`
      : `${randomNum} ${location}`;
  };

  // get loc for use below
  const location = generateLocation();

  // Generate random status
  const status = faker.helpers.arrayElement([
    Status.AVAILABLE,
    Status.IN_USE,
    Status.MAINTENANCE,
    Status.RETIRED,
  ]);

  // Generate lock name once to use consistently
  const lockName = `Lock ${faker.number.int({ min: 1000, max: 9999 })}`;

  // Create the lock first
  const lock = await prisma.lock.create({
    data: {
      name: lockName,
      location: location,
      status,
      qrCode: generateQRCode(),
      safetyProcedures: faker.helpers.arrayElements(
        safetyProceduresList,
        faker.number.int({ min: 3, max: 5 })
      ),
      userId,
    },
  });

  // Create events separately
  await prisma.event.createMany({
    data: [
      {
        type: EventType.LOCK_ASSIGNED,
        details: "Lock initially assigned",
        location: location,
        userId,
        lockName: lockName,
        lockStatus: status,
        lockId: lock.id,
      },
      {
        type: EventType.STATUS_CHANGED,
        location: location,
        details: `Lock status set to ${status}`,
        userId,
        lockName: lockName,
        lockStatus: status,
        lockId: lock.id,
      },
    ],
  });
  return lock;
}

function getRoleBasedPassword(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return "adminpass";
    case Role.SUPERVISOR:
      return "supervisorpass";
    case Role.USER:
      return "userpass";
    default:
      return "userpass";
  }
}

async function main() {
  // Parse command line arguments
  const argv = await yargs(hideBin(process.argv))
    .option("use-faker", {
      type: "boolean",
      description: "Use faker to generate random users",
    })
    .option("count", {
      type: "number",
      description: "Number of faker users to generate",
      default: 5,
    })
    .option("clear", {
      type: "boolean",
      description: "Clear existing data before seeding",
    })
    .option("add-locks", {
      type: "number",
      description: "Number of additional locks to create",
    }).argv;

  // Clear existing data if --clear flag is present
  if (argv.clear) {
    console.log("Clearing existing data...");
    await prisma.event.deleteMany();
    await prisma.lock.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create default bob user with locks and events
  const bobPassword = await hash("bob", 10);
  const bob = await prisma.user.upsert({
    where: { email: "bob@bob.bob" },
    update: {},
    create: {
      email: "bob@bob.bob",
      password: bobPassword,
      name: "Bob",
      role: Role.ADMIN,
    },
  });
  console.log("Created default user:", bob.email);

  // Create locks for bob
  const bobLockCount = argv["add-locks"] || 2; // Use add-locks value if provided, otherwise default to 2
  for (let i = 0; i < bobLockCount; i++) {
    const lock = await createLockWithEvents(bob.id);
    console.log(
      `Created lock for ${bob.email}: ${lock.name} at ${lock.location}`
    );
  }

  // Generate faker users if --use-faker flag is present
  if (argv["use-faker"]) {
    const count = argv.count;
    console.log(`Generating ${count} faker users...`);

    let adminCount = 0; // Track number of additional admins created

    for (let i = 0; i < count; i++) {
      const email = faker.internet.email().replace(/[^@]+$/, "example.com");

      // Determine role - ensure only one additional admin
      let role: Role;
      if (adminCount === 0 && i === 0) {
        role = Role.ADMIN;
        adminCount++;
      } else {
        // Randomly assign SUPERVISOR or USER role
        role = Math.random() < 0.3 ? Role.SUPERVISOR : Role.USER;
      }

      const rolePassword = getRoleBasedPassword(role);
      const password = await hash(rolePassword, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password,
          name: faker.person.fullName(),
          role,
        },
      });
      console.log(`Created faker user: ${user.email} with role: ${role}`);

      // Create locks for each faker user
      const userLockCount = faker.number.int({ min: 1, max: 3 });
      for (let j = 0; j < userLockCount; j++) {
        const lock = await createLockWithEvents(user.id);
        console.log(
          `Created lock for ${user.email}: ${lock.name} at ${lock.location}`
        );
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
