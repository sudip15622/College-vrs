"use server";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { CreateListingSchema } from "@/lib/schemas/listing";
import { revalidatePath } from "next/cache";

interface SearchListingsParams {
  limit?: number;
  page?: number;
  name?: string;
  type?: "Bike" | "Scooter";
  startDate?: Date;
  endDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  showAll?: boolean; // For admin/host view - show all listings regardless of availability
}

export async function searchListings(params: SearchListingsParams) {
  const {
    limit = 6,
    page = 1,
    name,
    type,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    showAll = false,
  } = params;

  const skip = (page - 1) * limit;

  // Build the where clause
  const where: any = {};

  // Only filter by availability if not showing all (for public search)
  if (!showAll) {
    where.isAvailable = true;
  }

  // Filter by name (case-insensitive search)
  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  // Filter by vehicle type
  if (type) {
    where.type = type;
  }

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerDay = {};
    if (minPrice !== undefined) {
      where.pricePerDay.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.pricePerDay.lte = maxPrice;
    }
  }

  // Filter by date availability (no overlapping bookings)
  if (startDate && endDate) {
    where.bookings = {
      none: {
        AND: [
          {
            startDate: {
              lt: startDate, // Booking starts before requested drop-off
            },
          },
          {
            endDate: {
              gt: endDate, // Booking ends after requested pickup
            },
          },
          {
            status: {
              in: ["Confirmed", "Active"], // Only check non-cancelled bookings
            },
          },
        ],
      },
    };
  }

  // Get total count for pagination
  const total = await prisma.listing.count({ where });

  // Get listings with pagination
  const listings = await prisma.listing.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      bookings: {
        where: {
          status: {
            in: ["Confirmed", "Active"],
          },
        },
        select: {
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
  });

  return {
    listings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllListings() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ["Confirmed", "Active"],
            },
          },
        },
      },
    });

    return listings;
  } catch (error) {
    console.error("Error fetching all listings:", error);
    return [];
  }
}

export async function getListingById(id: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        id,
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ["Confirmed", "Active"],
            },
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
          },
          orderBy: {
            startDate: "asc",
          },
        },
      },
    });

    return listing;
  } catch (error) {
    console.error("Error fetching listing by ID:", error);
    return null;
  }
}

export async function getListingBookings(listingId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        listingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching listing bookings:", error);
    return [];
  }
}

interface CreateListingActionParams {
  formData: {
    type: "Bike" | "Scooter";
    name: string;
    description: string;
    fuelType: "Petrol" | "Electric";
    transmission: "Manual" | "Automatic";
    engineCapacity?: string;
    mileage?: string;
    pricePerDay: string;
    condition: "Excellent" | "Good" | "Fair";
    features: string[];
  };
  imageData: string; // base64 encoded image
}

interface CreateListingActionReturn {
  success: boolean;
  error?: string;
  message?: string;
  listingId?: string;
}

export async function createListingAction(
  params: CreateListingActionParams
): Promise<CreateListingActionReturn> {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to create a listing",
      };
    }

    // Check if user is admin (only admins can create listings)
    // @ts-ignore
    // if (session.user.role !== "Admin") {
    //   return {
    //     success: false,
    //     error: "Only administrators can create listings",
    //   };
    // }

    // Validate form data with Zod schema
    const validatedData = CreateListingSchema.safeParse(params.formData);

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Invalid form data. Please check your inputs.",
      };
    }

    const data = validatedData.data;

    // Check if a listing with the same name already exists
    const existingListing = await prisma.listing.findUnique({
      where: { name: data.name },
    });

    if (existingListing) {
      return {
        success: false,
        error: "A vehicle with this name already exists. Please use a different name.",
      };
    }

    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        type: data.type,
        name: data.name,
        description: data.description,
        fuelType: data.fuelType,
        transmission: data.transmission,
        engineCapacity: data.engineCapacity || null,
        mileage: data.mileage || null,
        pricePerDay: data.pricePerDay,
        condition: data.condition,
        features: data.features,
        image: {
          url: params.imageData, // Using base64 for now
          publicId: "", // Would be from cloud storage
        },
        isAvailable: true,
      },
    });

    // Revalidate the listings pages
    revalidatePath("/");
    revalidatePath("/(public)/vehicles");
    revalidatePath("/hosting/listings");

    return {
      success: true,
      message: "Listing created successfully!",
      listingId: listing.id,
    };
  } catch (error) {
    console.error("Error creating listing:", error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "A vehicle with this name already exists.",
      };
    }

    return {
      success: false,
      error: "Failed to create listing. Please try again.",
    };
  }
}