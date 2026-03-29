import { z } from "zod";

export const ForgotPasswordEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address",
    ),
});

export const ForgotPasswordOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Please enter a 6-digit OTP")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export const ForgotPasswordResetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ForgotPasswordVerifyOtpSchema = ForgotPasswordEmailSchema.merge(
  ForgotPasswordOtpSchema,
);

export const ForgotPasswordResetWithTokenSchema =
  ForgotPasswordEmailSchema.extend({
    resetToken: z
      .string()
      .min(1, "Reset token is required"),
  }).merge(ForgotPasswordResetSchema);

export type ForgotPasswordEmailType = z.infer<typeof ForgotPasswordEmailSchema>;
export type ForgotPasswordOtpType = z.infer<typeof ForgotPasswordOtpSchema>;
export type ForgotPasswordResetType = z.infer<typeof ForgotPasswordResetSchema>;
export type ForgotPasswordVerifyOtpType = z.infer<
  typeof ForgotPasswordVerifyOtpSchema
>;
export type ForgotPasswordResetWithTokenType = z.infer<
  typeof ForgotPasswordResetWithTokenSchema
>;
