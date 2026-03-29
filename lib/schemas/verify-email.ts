import { z } from "zod";

export const VerifyEmailOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Please enter a 6-digit OTP")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export type VerifyEmailOtpType = z.infer<typeof VerifyEmailOtpSchema>;
