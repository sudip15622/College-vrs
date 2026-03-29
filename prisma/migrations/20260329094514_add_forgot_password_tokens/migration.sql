-- CreateEnum
CREATE TYPE "PasswordResetPurpose" AS ENUM ('FORGOT_PASSWORD');

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" "PasswordResetPurpose" NOT NULL DEFAULT 'FORGOT_PASSWORD',
    "otpHash" TEXT NOT NULL,
    "otpExpiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "verifiedAt" TIMESTAMP(3),
    "resetTokenHash" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_reset_tokens_email_purpose_idx" ON "password_reset_tokens"("email", "purpose");

-- CreateIndex
CREATE INDEX "password_reset_tokens_otpExpiresAt_idx" ON "password_reset_tokens"("otpExpiresAt");

-- CreateIndex
CREATE INDEX "password_reset_tokens_resetTokenExpiresAt_idx" ON "password_reset_tokens"("resetTokenExpiresAt");
