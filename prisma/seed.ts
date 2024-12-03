import { PrismaClient, Role, Status, EventType } from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const prisma = new PrismaClient();

async function createLockWithEvents(userId: string) {
  const lock = await prisma.lock.create({
    data: {
      name: faker.commerce.productName(),
      location: faker.location.streetAddress(),
      status: Status.AVAILABLE,
      qrCode: faker.string.uuid(),
      userId,
      events: {
        create: [
          {
            type: EventType.LOCK_ASSIGNED,
            details: "Lock initially assigned",
            userId,
          },
          {
            type: EventType.STATUS_CHANGED,
            details: "Lock set to available",
            userId,
          },
        ],
      },
    },
  });
  return lock;
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
      description: "Clear existing users before seeding",
    }).argv;

  // Clear existing data if --clear flag is present
  if (argv.clear) {
    console.log("Clearing existing data...");
    await prisma.event.deleteMany();
    await prisma.lock.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create default bob user with locks and events
  const hashedPassword = await hash("bob", 10);
  const bob = await prisma.user.upsert({
    where: { email: "bob@bob.bob" },
    update: {},
    create: {
      email: "bob@bob.bob",
      password: hashedPassword,
      name: "Bob",
      role: Role.ADMIN,
    },
  });
  console.log("Created default user:", bob.email);

  // Create locks for bob
  const bobLockCount = 2;
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

    for (let i = 0; i < count; i++) {
      const email = faker.internet.email();
      const password = await hash(faker.internet.password(), 10);
      const user = await prisma.user.create({
        data: {
          email,
          password,
          name: faker.person.fullName(),
          role: Role.USER,
        },
      });
      console.log("Created faker user:", user.email);

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
