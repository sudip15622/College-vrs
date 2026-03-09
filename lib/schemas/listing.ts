import { z } from 'zod'

// Enums matching Prisma schema
export const VehicleTypeEnum = z.enum(['Bike', 'Scooter'])
export const FuelTypeEnum = z.enum(['Petrol', 'Electric'])
export const TransmissionTypeEnum = z.enum(['Manual', 'Automatic'])
export const VehicleConditionEnum = z.enum(['Excellent', 'Good', 'Fair'])

// File validation helper
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Input schema for form (strings before transformation)
export const CreateListingFormSchema = z.object({
  type: VehicleTypeEnum,
  name: z
    .string()
    .min(3, 'Vehicle name must be at least 3 characters')
    .max(100, 'Vehicle name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  fuelType: FuelTypeEnum,
  transmission: TransmissionTypeEnum,
  engineCapacity: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseInt(val)
        return !isNaN(num) && num > 0 && num <= 2000
      },
      'Engine capacity must be between 1 and 2000 CC'
    ),
  mileage: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseInt(val)
        return !isNaN(num) && num > 0 && num <= 1000
      },
      'Mileage must be between 1 and 1000'
    ),
  pricePerDay: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, 'Price must be greater than 0')
    .refine(
      (val) => parseInt(val) <= 100000,
      'Price must be less than ₹1,00,000'
    ),
  condition: VehicleConditionEnum,
  features: z.array(z.string()),
})

// Output schema with transformed types (for server actions)
export const CreateListingSchema = z.object({
  type: VehicleTypeEnum,
  name: z
    .string()
    .min(3, 'Vehicle name must be at least 3 characters')
    .max(100, 'Vehicle name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  fuelType: FuelTypeEnum,
  transmission: TransmissionTypeEnum,
  engineCapacity: z
    .string()
    .optional()
    .transform((val) => (val && val !== '' ? parseInt(val) : undefined))
    .refine(
      (val) => val === undefined || (val > 0 && val <= 2000),
      'Engine capacity must be between 1 and 2000 CC'
    ),
  mileage: z
    .string()
    .optional()
    .transform((val) => (val && val !== '' ? parseInt(val) : undefined))
    .refine(
      (val) => val === undefined || (val > 0 && val <= 1000),
      'Mileage must be between 1 and 1000'
    ),
  pricePerDay: z
    .string()
    .min(1, 'Price is required')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'Price must be greater than 0')
    .refine((val) => val <= 100000, 'Price must be less than ₹1,00,000'),
  condition: VehicleConditionEnum,
  features: z.array(z.string()),
})

// Separate schema for image validation (client-side)
export const ImageFileSchema = z
  .instanceof(File, { message: 'Please upload an image file' })
  .refine((file) => file.size <= MAX_FILE_SIZE, 'Image size must be less than 10MB')
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png and .webp formats are supported'
  )

// Combined schema with image for full validation
export const CreateListingWithImageSchema = CreateListingSchema.extend({
  image: ImageFileSchema,
})

// Type exports
export type CreateListingFormType = z.infer<typeof CreateListingFormSchema>
export type CreateListingType = z.infer<typeof CreateListingSchema>
export type CreateListingWithImageType = z.infer<typeof CreateListingWithImageSchema>
