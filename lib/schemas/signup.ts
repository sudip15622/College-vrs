import { z } from "zod";

export const SignupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(
      /^[A-Za-z]+( [A-Za-z]+)*$/,
      "Name must contain only alphabets with single spaces between words"
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export type SignupType = z.infer<typeof SignupSchema>;
