"use server";
import prisma from "@/prisma";

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