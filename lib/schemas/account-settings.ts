import { z } from "zod";

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .regex(
        strongPasswordRegex,
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmNewPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: "New password and confirm password must match",
    path: ["confirmNewPassword"],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export const DeleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required"),
  confirmationText: z
    .string()
    .trim()
    .refine((value) => value === "DELETE", {
      message: 'Type "DELETE" to confirm account deletion',
    }),
});

export type ChangePasswordInput = z.input<typeof ChangePasswordSchema>;
export type ChangePasswordType = z.output<typeof ChangePasswordSchema>;

export type DeleteAccountInput = z.input<typeof DeleteAccountSchema>;
export type DeleteAccountType = z.output<typeof DeleteAccountSchema>;
