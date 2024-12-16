import { PrismaClient, Role, Status, EventType } from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const prisma = new PrismaClient();

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

  const lock = await prisma.lock.create({
    data: {
      name: `Lock ${faker.number.int({ min: 1000, max: 9999 })}`, // Random lock identifier
      location: location, // Warehouse-oriented location
      status: Status.AVAILABLE,
      qrCode: faker.string.uuid(),
      userId,
      events: {
        create: [
          {
            type: EventType.LOCK_ASSIGNED,
            details: "Lock initially assigned",
            location: location,
            userId,
          },
          {
            type: EventType.STATUS_CHANGED,
            location: location,
            details: "Lock set to available",
            userId,
          },
        ],
      },
    },
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

    let adminCount = 0; // Track number of additional admins created

    for (let i = 0; i < count; i++) {
      const email = faker.internet.email();

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
