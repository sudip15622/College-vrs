import { z } from "zod";

export const ProfileEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be less than 80 characters")
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Name can only contain letters and single spaces",
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address",
    ),
  image: z
    .string()
    .trim()
    .refine((value) => value === "" || /^https?:\/\/.+/.test(value), {
      message: "Image URL must start with http:// or https://",
    }),
});

export type ProfileEditInput = z.input<typeof ProfileEditSchema>;
export type ProfileEditType = z.output<typeof ProfileEditSchema>;
