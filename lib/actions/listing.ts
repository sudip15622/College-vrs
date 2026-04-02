"use server";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { CreateListingSchema } from "@/lib/schemas/listing";
import { revalidatePath } from "next/cache";
import { calculateListingRating } from "@/lib/actions/review";

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

interface RecommendedListingsParams {
  limit?: number;
}

interface RecommendationContext {
  maxBookings: number;
  maxRecentBookings: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
}

interface RecommendationUserProfile {
  preferredTypes: Set<string>;
  averageBudget: number | null;
}

function clamp01(value: number) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function normalizeByMax(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }
  return clamp01(value / max);
}

function getMedian(numbers: number[]) {
  if (!numbers.length) {
    return 0;
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

async function getRecommendationUserProfile(userId: string) {
  const userBookings = await prisma.booking.findMany({
    where: {
      userId,
      status: {
        in: ["Confirmed", "Active", "Completed"],
      },
    },
    select: {
      pricePerDay: true,
      bookedAt: true,
      listing: {
        select: {
          type: true,
        },
      },
    },
    orderBy: {
      bookedAt: "desc",
    },
    take: 20,
  });

  if (!userBookings.length) {
    return null;
  }

  const now = new Date();
  const recentCutoff = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
  const recentBookings = userBookings.filter(
    (booking) => booking.bookedAt >= recentCutoff
  );

  const sourceBookings = recentBookings.length >= 3 ? recentBookings : userBookings;
  const typeCounts = new Map<string, number>();

  for (const booking of sourceBookings) {
    const type = booking.listing.type;
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
  }

  const mostCommonTypeCount = Math.max(...typeCounts.values());
  const preferredTypes = new Set(
    [...typeCounts.entries()]
      .filter(([, count]) => count === mostCommonTypeCount)
      .map(([type]) => type)
  );

  const averageBudget =
    sourceBookings.reduce((sum, booking) => sum + booking.pricePerDay, 0) /
    sourceBookings.length;

  return {
    preferredTypes,
    averageBudget,
  } as RecommendationUserProfile;
}

export async function getRecommendedListings(params: RecommendedListingsParams = {}) {
  const limit = Math.min(Math.max(params.limit ?? 8, 1), 12);

  const session = await auth();
  const userId = session?.user?.id;

  const [candidates, userProfile] = await Promise.all([
    prisma.listing.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ["Confirmed", "Active", "Completed"],
            },
          },
          select: {
            bookedAt: true,
          },
        },
        reviews: {
          select: {
            rating: true,
            createdAt: true,
          },
        },
      },
      take: 60,
      orderBy: {
        createdAt: "desc",
      },
    }),
    userId ? getRecommendationUserProfile(userId) : Promise.resolve(null),
  ]);

  if (!candidates.length) {
    return [];
  }

  const now = new Date();
  const recentBookingCutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const bookingCounts = candidates.map((listing) => listing.bookings.length);
  const recentBookingCounts = candidates.map(
    (listing) =>
      listing.bookings.filter((booking) => booking.bookedAt >= recentBookingCutoff)
        .length
  );
  const prices = candidates.map((listing) => listing.pricePerDay);

  const recommendationContext: RecommendationContext = {
    maxBookings: Math.max(...bookingCounts, 1),
    maxRecentBookings: Math.max(...recentBookingCounts, 1),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    medianPrice: getMedian(prices),
  };

  const scoredListings = candidates
    .map((listing) => {
      const bookingCount = listing.bookings.length;
      const recentBookingCount = listing.bookings.filter(
        (booking) => booking.bookedAt >= recentBookingCutoff
      ).length;

      const reviewCount = listing.reviews.length;
      const averageRating =
        reviewCount > 0
          ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviewCount
          : 0;

      const popularityScore =
        normalizeByMax(bookingCount, recommendationContext.maxBookings) * 0.7 +
        normalizeByMax(recentBookingCount, recommendationContext.maxRecentBookings) * 0.3;

      const reviewConfidence = reviewCount / (reviewCount + 4);
      const qualityScore =
        clamp01(averageRating / 5) * 0.8 + clamp01(reviewConfidence) * 0.2;

      const priceRange = recommendationContext.maxPrice - recommendationContext.minPrice;
      const marketCenterDistance = Math.abs(
        listing.pricePerDay - recommendationContext.medianPrice
      );

      const marketFitScore =
        priceRange > 0
          ? clamp01(1 - marketCenterDistance / Math.max(priceRange / 2, 1))
          : 0.7;

      const affordabilityScore =
        priceRange > 0
          ? clamp01(
              (recommendationContext.maxPrice - listing.pricePerDay) /
                Math.max(priceRange, 1)
            )
          : 0.7;

      const valueScore = marketFitScore * 0.6 + affordabilityScore * 0.4;

      const daysSinceCreated =
        (now.getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const freshnessScore = clamp01(1 - daysSinceCreated / 180);

      let personalizationScore = 0;

      if (userProfile) {
        if (userProfile.preferredTypes.has(listing.type)) {
          personalizationScore += 0.12;
        }

        if (userProfile.averageBudget !== null) {
          const priceDistance =
            Math.abs(listing.pricePerDay - userProfile.averageBudget) /
            Math.max(userProfile.averageBudget, 1);
          personalizationScore += 0.08 * clamp01(1 - priceDistance);
        }
      }

      const coldStartBoost = bookingCount === 0 && reviewCount === 0 ? 0.03 : 0;

      const score =
        popularityScore * 0.33 +
        qualityScore * 0.29 +
        valueScore * 0.18 +
        freshnessScore * 0.12 +
        personalizationScore +
        coldStartBoost;

      const reasons: string[] = [];

      if (popularityScore >= 0.65) {
        reasons.push("Popular choice");
      }
      if (qualityScore >= 0.7 && reviewCount > 0) {
        reasons.push("Highly rated");
      }
      if (valueScore >= 0.65) {
        reasons.push("Great value");
      }
      if (freshnessScore >= 0.75) {
        reasons.push("Recently listed");
      }
      if (userProfile && userProfile.preferredTypes.has(listing.type)) {
        reasons.push("Matches your booking style");
      }
      if (reasons.length === 0) {
        reasons.push("Recommended for you");
      }

      return {
        ...listing,
        averageRating,
        reviewCount,
        recommendationScore: score,
        recommendationReasons: reasons,
      };
    })
    .sort((a, b) => {
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const diversified: typeof scoredListings = [];
  const remaining = [...scoredListings];

  while (diversified.length < limit && remaining.length > 0) {
    const lastType = diversified[diversified.length - 1]?.type;
    const nextIndex = remaining.findIndex(
      (item) => item.type !== lastType || remaining.length === 1
    );
    const indexToUse = nextIndex === -1 ? 0 : nextIndex;
    diversified.push(remaining.splice(indexToUse, 1)[0]);
  }

  return diversified.map((listing) => ({
    id: listing.id,
    type: listing.type,
    name: listing.name,
    description: listing.description,
    pricePerDay: listing.pricePerDay,
    image: listing.image,
    isAvailable: listing.isAvailable,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    averageRating: Number(listing.averageRating.toFixed(2)),
    reviewCount: listing.reviewCount,
    recommendationScore: Number(listing.recommendationScore.toFixed(4)),
    recommendationReasons: listing.recommendationReasons,
  }));
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

  // Calculate ratings for all listings using the custom algorithm
  const ratingPromises = listings.map((listing) =>
    calculateListingRating(listing.id).then((result) => ({
      listingId: listing.id,
      averageRating: result.averageRating,
      reviewCount: result.stats.totalReviews,
    }))
  );

  const ratings = await Promise.all(ratingPromises);
  const ratingsMap = new Map(ratings.map((r) => [r.listingId, r]));

  const listingsWithReviewStats = listings.map((listing) => {
    const stats = ratingsMap.get(listing.id);

    return {
      ...listing,
      averageRating: stats?.averageRating ?? 0,
      reviewCount: stats?.reviewCount ?? 0,
    };
  });

  return {
    listings: listingsWithReviewStats,
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
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!listing) {
      return null;
    }

    // Calculate rating using the custom algorithm
    const ratingResult = await calculateListingRating(id);

    return {
      ...listing,
      averageRating: ratingResult.averageRating,
      reviewCount: ratingResult.stats.totalReviews,
    };
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

export async function getListingReviews(listingId: string) {
  try {
    const [listing, reviews, reviewAggregate] = await Promise.all([
      prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.review.findMany({
        where: {
          listingId,
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
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
          createdAt: "desc",
        },
      }),
      prisma.review.aggregate({
        where: {
          listingId,
        },
        _avg: {
          rating: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    if (!listing) {
      return null;
    }

    return {
      listing,
      reviews,
      stats: {
        averageRating: Number((reviewAggregate._avg.rating ?? 0).toFixed(2)),
        reviewCount: reviewAggregate._count._all,
      },
    };
  } catch (error) {
    console.error("Error fetching listing reviews:", error);
    return null;
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

interface UpdateListingActionParams {
  listingId: string;
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
  imageData?: string;
}

interface UpdateListingActionReturn {
  success: boolean;
  error?: string;
  message?: string;
}

interface ToggleListingAvailabilityActionParams {
  listingId: string;
  isAvailable: boolean;
}

interface ToggleListingAvailabilityActionReturn {
  success: boolean;
  error?: string;
  message?: string;
}

interface DeleteListingActionParams {
  listingId: string;
}

interface DeleteListingActionReturn {
  success: boolean;
  error?: string;
  message?: string;
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

export async function updateListingAction(
  params: UpdateListingActionParams
): Promise<UpdateListingActionReturn> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to update a listing",
      };
    }

    const existingListing = await prisma.listing.findUnique({
      where: { id: params.listingId },
      select: { id: true, image: true },
    });

    if (!existingListing) {
      return {
        success: false,
        error: "Listing not found",
      };
    }

    const validatedData = CreateListingSchema.safeParse(params.formData);

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Invalid form data. Please check your inputs.",
      };
    }

    const data = validatedData.data;

    const duplicateNameListing = await prisma.listing.findFirst({
      where: {
        name: data.name,
        id: {
          not: params.listingId,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicateNameListing) {
      return {
        success: false,
        error: "A vehicle with this name already exists. Please use a different name.",
      };
    }

    await prisma.listing.update({
      where: {
        id: params.listingId,
      },
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
        ...(params.imageData
          ? {
              image: {
                url: params.imageData,
                publicId: "",
              },
            }
          : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/(public)/vehicles");
    revalidatePath("/hosting/listings");
    revalidatePath(`/hosting/listings/${params.listingId}`);
    revalidatePath(`/hosting/listings/${params.listingId}/edit`);

    return {
      success: true,
      message: "Listing updated successfully!",
    };
  } catch (error) {
    console.error("Error updating listing:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "A vehicle with this name already exists.",
      };
    }

    return {
      success: false,
      error: "Failed to update listing. Please try again.",
    };
  }
}

export async function getListingSettingsById(id: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        isAvailable: true,
      },
    });

    if (!listing) {
      return null;
    }

    const [pendingBookings, confirmedBookings, activeBookings] = await Promise.all([
      prisma.booking.count({
        where: {
          listingId: id,
          status: "Pending",
        },
      }),
      prisma.booking.count({
        where: {
          listingId: id,
          status: "Confirmed",
        },
      }),
      prisma.booking.count({
        where: {
          listingId: id,
          status: "Active",
        },
      }),
    ]);

    return {
      ...listing,
      pendingBookings,
      confirmedBookings,
      activeBookings,
      blockingBookingsCount: pendingBookings + activeBookings + confirmedBookings,
    };
  } catch (error) {
    console.error("Error fetching listing settings by ID:", error);
    return null;
  }
}

export async function toggleListingAvailabilityAction(
  params: ToggleListingAvailabilityActionParams
): Promise<ToggleListingAvailabilityActionReturn> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to update availability",
      };
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.listingId },
      select: { id: true, name: true },
    });

    if (!listing) {
      return {
        success: false,
        error: "Listing not found",
      };
    }

    await prisma.listing.update({
      where: { id: params.listingId },
      data: { isAvailable: params.isAvailable },
    });

    revalidatePath("/");
    revalidatePath("/(public)/vehicles");
    revalidatePath("/hosting/listings");
    revalidatePath(`/hosting/listings/${params.listingId}`);
    revalidatePath(`/hosting/listings/${params.listingId}/settings`);

    return {
      success: true,
      message: params.isAvailable
        ? "Vehicle is now available for booking"
        : "Vehicle has been paused",
    };
  } catch (error) {
    console.error("Error toggling listing availability:", error);
    return {
      success: false,
      error: "Failed to update availability. Please try again.",
    };
  }
}

export async function deleteListingAction(
  params: DeleteListingActionParams
): Promise<DeleteListingActionReturn> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to delete a vehicle",
      };
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.listingId },
      select: { id: true, name: true },
    });

    if (!listing) {
      return {
        success: false,
        error: "Listing not found",
      };
    }

    const blockingBookingsCount = await prisma.booking.count({
      where: {
        listingId: params.listingId,
        status: {
          in: ["Pending", "Confirmed", "Active"],
        },
      },
    });

    if (blockingBookingsCount > 0) {
      return {
        success: false,
        error:
          "This vehicle cannot be deleted because it has pending, confirmed or active bookings.",
      };
    }

    await prisma.listing.delete({
      where: { id: params.listingId },
    });

    revalidatePath("/");
    revalidatePath("/(public)/vehicles");
    revalidatePath("/hosting/listings");

    return {
      success: true,
      message: "Vehicle deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting listing:", error);
    return {
      success: false,
      error: "Failed to delete vehicle. Please try again.",
    };
  }
}