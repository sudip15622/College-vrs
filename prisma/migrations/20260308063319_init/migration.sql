-- CreateEnum
CREATE TYPE "Role" AS ENUM ('User', 'Admin');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Bike', 'Scooter');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('Petrol', 'Electric');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('Manual', 'Automatic');

-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('Excellent', 'Good', 'Fair');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Confirmed', 'Active', 'Completed', 'Cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'User',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL DEFAULT 'Petrol',
    "transmission" "TransmissionType" NOT NULL DEFAULT 'Manual',
    "engineCapacity" INTEGER,
    "mileage" INTEGER,
    "pricePerDay" INTEGER NOT NULL,
    "features" JSONB,
    "condition" "VehicleCondition" NOT NULL DEFAULT 'Excellent',
    "image" JSONB NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePerDay" DOUBLE PRECISION NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'Confirmed',
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "listings_name_key" ON "listings"("name");

-- CreateIndex
CREATE INDEX "listings_type_isAvailable_idx" ON "listings"("type", "isAvailable");

-- CreateIndex
CREATE INDEX "listings_name_idx" ON "listings"("name");

-- CreateIndex
CREATE INDEX "listings_pricePerDay_idx" ON "listings"("pricePerDay");

-- CreateIndex
CREATE INDEX "listings_createdAt_idx" ON "listings"("createdAt");

-- CreateIndex
CREATE INDEX "listings_isAvailable_createdAt_idx" ON "listings"("isAvailable", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

-- CreateIndex
CREATE INDEX "bookings_listingId_idx" ON "bookings"("listingId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_startDate_endDate_idx" ON "bookings"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "bookings_listingId_startDate_endDate_idx" ON "bookings"("listingId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "bookings_status_startDate_idx" ON "bookings"("status", "startDate");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
