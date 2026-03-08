import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { customHash, generateSalt } from "@/lib/hash";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  // Clear existing data before seeding
  console.log("Clearing existing data...");
  
  await prisma.booking.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log("Database cleared successfully!");
  console.log("Starting to seed data...");

  // Create Admin user (owns all vehicles)
  const adminSalt = generateSalt();
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@vrs.com",
      salt: adminSalt,
      password: customHash("Admin@123", adminSalt),
      role: "Admin",
    },
  });

  console.log("Created admin:", admin.email);

  // Create regular users
  const aliceSalt = generateSalt();
  const ayushSalt = generateSalt();
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Don",
        email: "alice@gmail.com",
        salt: aliceSalt,
        password: customHash("Alice@15622", aliceSalt),
        role: "User",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ayush Pandey",
        email: "ayush@gmail.com",
        salt: ayushSalt,
        password: customHash("Ayush@15622", ayushSalt),
        role: "User",
      },
    }),
  ]);

  console.log(`Created ${users.length} regular users`);

  // Create vehicle listings (all owned by admin/platform)
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        type: "Bike",
        name: "KTM Duke 390",
        description:
          "The KTM 390 Duke is a popular lightweight naked bike featuring a new 399cc liquid-cooled single-cylinder engine (around 45 hp/39 Nm torque), a lightweight frame with adjustable WP APEX suspension, upgraded ByBre brakes, and premium tech like Cornering ABS, Motorcycle Traction Control (MTC), and ride modes, offering agile handling and exciting performance for its class, with updated styling for recent models.",
        pricePerDay: 1000,
        fuelType: "Petrol",
        transmission: "Manual",
        engineCapacity: 399,
        mileage: 30,
        condition: "Excellent",
        features: [
          "ABS",
          "Disc Brakes",
          "LED Headlights",
          "Digital Speedometer",
          "Self Start",
          "GPS Tracker",
          "Mobile Holder",
          "Alloy Wheels",
        ],
        image: { url: "/vehicle1.jfif", publicId: "1" },
      },
    }),
    prisma.listing.create({
      data: {
        type: "Scooter",
        name: "Honda Dio",
        description:
          "The Honda Dio is a stylish and fuel-efficient scooter perfect for city commuting. Features a reliable engine, comfortable seating, and ample storage space under the seat.",
        pricePerDay: 800,
        fuelType: "Petrol",
        transmission: "Automatic",
        engineCapacity: 110,
        mileage: 50,
        condition: "Excellent",
        features: [
          "Extra Helmet Provided",
          "USB Charging Port",
          "LED Headlights",
          "Digital Speedometer",
          "Under-Seat Storage",
          "Self Start",
          "Mobile Holder",
        ],
        image: { url: "/vehicle.jfif", publicId: "12" },
      },
    }),
    prisma.listing.create({
      data: {
        type: "Bike",
        name: "Royal Enfield Classic 350",
        description:
          "Classic Royal Enfield motorcycle known for its distinctive thump and retro styling. Perfect for both city rides and long highway cruises.",
        pricePerDay: 1200,
        fuelType: "Petrol",
        transmission: "Manual",
        engineCapacity: 349,
        mileage: 35,
        condition: "Good",
        features: [
          "Extra Helmet Provided",
          "Disc Brakes",
          "LED Headlights",
          "Self Start",
          "GPS Tracker",
          "Mobile Holder",
          "Alloy Wheels",
        ],
        image: { url: "/vehicle3.jfif", publicId: "123" },
      },
    }),
    prisma.listing.create({
      data: {
        type: "Bike",
        name: "Yamaha MT-15",
        description:
          "Sporty naked street bike with aggressive styling and powerful performance. Features a liquid-cooled engine and sharp handling characteristics.",
        pricePerDay: 1100,
        fuelType: "Petrol",
        transmission: "Manual",
        engineCapacity: 155,
        mileage: 45,
        condition: "Excellent",
        features: [
          "ABS",
          "Disc Brakes",
          "LED Headlights",
          "Digital Speedometer",
          "Self Start",
          "GPS Tracker",
          "Alloy Wheels",
        ],
        image: { url: "/vehicle4.jfif", publicId: "1234" },
      },
    }),
    prisma.listing.create({
      data: {
        type: "Bike",
        name: "Kawasaki Ninja 300",
        description:
          "Iconic sport bike with sleek aerodynamic design and thrilling performance. Perfect for enthusiasts seeking speed and style.",
        pricePerDay: 1500,
        fuelType: "Petrol",
        transmission: "Manual",
        engineCapacity: 296,
        mileage: 25,
        condition: "Excellent",
        features: [
          "ABS",
          "Disc Brakes",
          "LED Headlights",
          "Digital Speedometer",
          "Self Start",
          "GPS Tracker",
          "Mobile Holder",
          "Alloy Wheels",
          "Bluetooth Connectivity",
        ],
        image: { url: "/vehicle5.jfif", publicId: "12345" },
      },
    }),
    prisma.listing.create({
      data: {
        type: "Scooter",
        name: "Vespa Urban 125",
        description:
          "Classic Italian scooter combining timeless design with modern technology. Ideal for stylish urban transportation.",
        pricePerDay: 900,
        fuelType: "Petrol",
        transmission: "Automatic",
        engineCapacity: 125,
        mileage: 45,
        condition: "Good",
        features: [
          "Extra Helmet Provided",
          "USB Charging Port",
          "LED Headlights",
          "Digital Speedometer",
          "Under-Seat Storage",
          "Self Start",
          "Disc Brakes",
        ],
        image: { url: "/vehicle2.jfif", publicId: "123456" },
      },
    }),
  ]);

  console.log(`Created ${listings.length} vehicle listings`);
  console.log("Seed data created successfully!");
}

main();
