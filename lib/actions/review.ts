"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  recentReviews: number; // Last 30 days
  reviewsWithComments: number;
}

export interface ReviewCalculationResult {
  averageRating: number;
  stats: ReviewStats;
}

/**
 * Calculate weighted average rating for a listing
 * Algorithm:
 * - Base: Average of all review ratings (1-5)
 * - Shows metadata separately (recent reviews, comment %, etc)
 * - Recent reviews (0-30 days) weighted higher visually
 */
export async function calculateListingRating(
  listingId: string,
): Promise<ReviewCalculationResult> {
  const reviews = await prisma.review.findMany({
    where: { listingId },
    select: {
      rating: true,
      comment: true,
      createdAt: true,
    },
  });

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      stats: {
        averageRating: 0,
        totalReviews: 0,
        recentReviews: 0,
        reviewsWithComments: 0,
      },
    };
  }

  // Calculate basic average
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = parseFloat(
    (totalRating / reviews.length).toFixed(2),
  );

  // Calculate metadata for transparency
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentReviews = reviews.filter(review => 
    new Date(review.createdAt) >= thirtyDaysAgo
  ).length;

  const reviewsWithComments = reviews.filter(
    review => review.comment && review.comment.trim().length > 0
  ).length;

  return {
    averageRating,
    stats: {
      averageRating,
      totalReviews: reviews.length,
      recentReviews,
      reviewsWithComments,
    },
  };
}

/**
 * Submit a review for a completed booking
 */
export async function submitReview(
  bookingId: string,
  rating: number,
  comment?: string,
  hasPhotos: boolean = false,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to submit a review",
      };
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      };
    }

    // Validate comment if provided
    if (comment && comment.trim().length > 500) {
      return {
        success: false,
        error: "Comment must be 500 characters or less",
      };
    }

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: { id: true },
        },
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    if (booking.userId !== session.user.id) {
      return {
        success: false,
        error: "You can only review your own bookings",
      };
    }

    // Check if booking is completed
    if (booking.status !== "Completed") {
      return {
        success: false,
        error: "You can only review completed bookings",
      };
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return {
        success: false,
        error: "You have already reviewed this booking",
      };
    }

    // Check if review is within 30 days of completion
    const completedDate = booking.completedAt;
    if (completedDate) {
      const thirtyDaysAfterCompletion = new Date(
        completedDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      if (new Date() > thirtyDaysAfterCompletion) {
        return {
          success: false,
          error: "Review window has closed (30 days after booking completion)",
        };
      }
    }

    const trimmedComment = comment?.trim() || null;
    const commentLength = trimmedComment?.length || 0;

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        listingId: booking.listingId,
        bookingId: bookingId,
        rating,
        comment: trimmedComment,
        hasPhotos,
        commentLength,
      },
    });

    // Calculate new listing rating after review
    const updatedRating = await calculateListingRating(booking.listingId);

    return {
      success: true,
      message: "Review submitted successfully",
      data: {
        review,
        listingRating: updatedRating,
      },
    };
  } catch (error) {
    console.error("Error submitting review:", error);
    return {
      success: false,
      error: "Failed to submit review. Please try again.",
    };
  }
}

/**
 * Get all reviews for a listing
 */
export async function getListingReviews(listingId: string, limit = 10) {
  try {
    const reviews = await prisma.review.findMany({
      where: { listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const total = await prisma.review.count({
      where: { listingId },
    });

    const rating = await calculateListingRating(listingId);

    return {
      success: true,
      data: {
        reviews,
        rating: rating.averageRating,
        stats: rating.stats,
        total,
      },
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return {
      success: false,
      error: "Failed to fetch reviews",
    };
  }
}

/**
 * Check if user can review a booking
 */
export async function canUserReviewBooking(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        canReview: false,
        reason: "Not logged in",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        canReview: false,
        reason: "Booking not found",
      };
    }

    if (booking.userId !== session.user.id) {
      return {
        canReview: false,
        reason: "Not your booking",
      };
    }

    if (booking.status !== "Completed") {
      return {
        canReview: false,
        reason: `Booking status is ${booking.status}. Only completed bookings can be reviewed.`,
      };
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return {
        canReview: false,
        reason: "You have already reviewed this booking",
      };
    }

    const completedDate = booking.completedAt;
    if (completedDate) {
      const thirtyDaysAfterCompletion = new Date(
        completedDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      if (new Date() > thirtyDaysAfterCompletion) {
        return {
          canReview: false,
          reason: "Review window has closed (30 days after booking completion)",
        };
      }
    }

    return {
      canReview: true,
      reason: "You can review this booking",
    };
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return {
      canReview: false,
      reason: "Error checking eligibility",
    };
  }
}
