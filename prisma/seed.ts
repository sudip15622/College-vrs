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
  
  await prisma.review.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log("Database cleared successfully!");
  console.log("Starting to seed data...");

  // Create Admin user
  const adminSalt = generateSalt();
  const admin = await prisma.user.create({
    data: {
      name: "Sudeep Lamichhane",
      email: "sudeeplamichhane18@gmail.com",
      salt: adminSalt,
      password: customHash("Admin@15622", adminSalt),
      role: "Admin",
      emailVerified: new Date("2025-12-01"),
    },
  });

  console.log("Created admin:", admin.email);

  // Create one regular user
  const userSalt = generateSalt();
  
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "hellomf15622@gmail.com",
      salt: userSalt,
      password: customHash("User@15622", userSalt),
      role: "User",
      emailVerified: new Date("2025-12-15"),
    },
  });

  console.log("Created user:", user.email);

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

  // Create 6 completed bookings for the first vehicle (KTM Duke 390)
  const targetVehicle = listings[0]; // KTM Duke 390
  const bookings = [];

  const bookingDates = [
    { start: new Date(2026, 0, 5), end: new Date(2026, 0, 10) }, // January 2026
    { start: new Date(2026, 0, 18), end: new Date(2026, 0, 23) }, // January 2026
    { start: new Date(2026, 1, 5), end: new Date(2026, 1, 10) }, // February 2026
    { start: new Date(2026, 1, 18), end: new Date(2026, 1, 23) }, // February 2026
    { start: new Date(2026, 2, 10), end: new Date(2026, 2, 15) }, // March 2026
    { start: new Date(2026, 2, 25), end: new Date(2026, 2, 30) }, // March 2026
  ];

  for (let i = 0; i < 6; i++) {
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        listingId: targetVehicle.id,
        startDate: bookingDates[i].start,
        endDate: bookingDates[i].end,
        pricePerDay: targetVehicle.pricePerDay,
        totalDays: 5,
        totalPrice: targetVehicle.pricePerDay * 5,
        renterContactNumber: "9841234567",
        renterNotes: "Looking forward to the ride!",
        status: "Completed",
        isPaid: true,
        paidAt: bookingDates[i].start,
        bookedAt: new Date(bookingDates[i].start.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
        completedAt: bookingDates[i].end,
      },
    });
    bookings.push(booking);
  }

  console.log(`Created ${bookings.length} completed bookings`);

  // Create 6 reviews with varying ratings, comment lengths, and dates
  // Algorithm showcase: different ratings (1-5), varied comment lengths, different dates
  const reviewData = [
    {
      rating: 5,
      comment: "Excellent bike! Runs smoothly and very comfortable to ride. Highly recommended!",
      daysAfterCompletion: 2,
    },
    {
      rating: 4,
      comment:
        "Great experience overall. The bike was well maintained and the rental process was smooth. Would rent again. Very professional service.",
      daysAfterCompletion: 3,
    },
    {
      rating: 5,
      comment: "Perfect bike.",
      daysAfterCompletion: 1,
    },
    {
      rating: 2,
      comment:
        "The bike had some issues during my rental. The throttle response was inconsistent and the bike felt a bit sluggish. Customer service was helpful in resolving it though.",
      daysAfterCompletion: 6,
    },
    {
      rating: 5,
      comment:
        "Absolutely love this KTM! The engine is powerful, handling is precise, acceleration is smooth, and it was delivered and picked up on time. Best rental experience ever! Would definitely rent again.",
      daysAfterCompletion: 2,
    },
    {
      rating: 4,
      comment: "Good bike.",
      daysAfterCompletion: 4,
    },
  ];

  for (let i = 0; i < 6; i++) {
    const reviewDate = new Date(
      bookings[i].completedAt!.getTime() + reviewData[i].daysAfterCompletion * 24 * 60 * 60 * 1000,
    );

    await prisma.review.create({
      data: {
        userId: user.id,
        listingId: targetVehicle.id,
        bookingId: bookings[i].id,
        rating: reviewData[i].rating,
        comment: reviewData[i].comment,
        commentLength: reviewData[i].comment.length,
        hasPhotos: i % 2 === 0, // Alternate photos
        createdAt: reviewDate,
      },
    });
  }

  console.log("Created 6 reviews with varying ratings and comment lengths");
  console.log("Seed data created successfully!");
}

main();
