/*
  Warnings:

  - You are about to alter the column `pricePerDay` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `totalPrice` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `renterContactNumber` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Khalti', 'Esewa', 'Cash');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('Pending', 'Processed', 'Failed');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'Pending';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerNotes" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "refundAmount" INTEGER,
ADD COLUMN     "refundStatus" "RefundStatus",
ADD COLUMN     "renterContactNumber" TEXT NOT NULL,
ADD COLUMN     "renterNotes" TEXT,
ALTER COLUMN "pricePerDay" SET DATA TYPE INTEGER,
ALTER COLUMN "totalPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "image" SET DEFAULT '/default_user.png';
