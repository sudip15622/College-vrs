import { z } from "zod";

export const bookingFormSchema = z.object({
  renterContactNumber: z
    .string()
    .length(10, "Contact number must be exactly 10 digits")
    .regex(/^(97|98)\d{8}$/, "Contact number must start with 97 or 98 and be 10 digits"),
  renterNotes: z
    .string()
    .max(500, "Message must be less than 500 characters")
    .optional(),
  paymentMethod: z.enum(["Khalti", "Esewa"], "Please select a payment method"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;


export const createBookingSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  renterContactNumber: z
    .string()
    .length(10, 'Contact number must be exactly 10 digits')
    .regex(
      /^(97|98)\d{8}$/,
      'Contact number must start with 97 or 98 and be 10 digits',
    ),
  renterNotes: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  paymentMethod: z.enum(['Khalti', 'Esewa'], 'Please select a payment method'),
  totalDays: z.number().int().positive(),
  pricePerDay: z.number().int().positive(),
  totalPrice: z.number().int().positive(),
});

export type CreateBookingData = z.infer<typeof createBookingSchema>;
