"use server";
import { auth } from "@/auth";
import { CreateBookingData } from "../schemas/booking";
import prisma from "@/prisma";
import { initiateKhaltiPayment } from "./payment";
import { refundKhaltiPaymentByPidx } from "./payment";

export async function InitiateBooking(
  listingId: string,
  details: CreateBookingData,
) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to make a booking",
      };
    }

    // 2. Validate dates
    const startDate = new Date(details.startDate);
    const endDate = new Date(details.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return {
        success: false,
        error: "Start date cannot be in the past",
      };
    }

    if (endDate <= startDate) {
      return {
        success: false,
        error: "End date must be after start date",
      };
    }

    // 3. Check if listing exists and is available
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return {
        success: false,
        error: "Vehicle not found",
      };
    }

    if (!listing.isAvailable) {
      return {
        success: false,
        error: "This vehicle is not available for booking",
      };
    }

    // 4. Check for date conflicts with confirmed/active bookings
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        listingId: listingId,
        status: {
          in: ["Confirmed", "Active"],
        },
        OR: [
          {
            // New booking starts during existing booking
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            // New booking ends during existing booking
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            // New booking completely contains existing booking
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (conflictingBookings) {
      return {
        success: false,
        error:
          "These dates are no longer available. Please select different dates.",
      };
    }

    // 5. Validate pricing (security check)
    const calculatedDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const calculatedTotal = listing.pricePerDay * calculatedDays;

    if (
      details.totalDays !== calculatedDays ||
      details.pricePerDay !== listing.pricePerDay ||
      details.totalPrice !== calculatedTotal
    ) {
      return {
        success: false,
        error: "Invalid pricing data. Please refresh and try again.",
      };
    }

    // 6. Create booking with Pending status and expiration
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        listingId: listingId,
        startDate: startDate,
        endDate: endDate,
        pricePerDay: details.pricePerDay,
        totalDays: details.totalDays,
        totalPrice: details.totalPrice,
        renterContactNumber: details.renterContactNumber,
        renterNotes: details.renterNotes,
        paymentMethod: details.paymentMethod,
        status: "Pending",
        isPaid: false,
        expiredAt: expiresAt,
      },
    });

    let paymentData: any = null;
    if (details.paymentMethod === "Khalti") {
      paymentData = await initiateKhaltiPayment(booking.id);
    } else if (details.paymentMethod === "Esewa") {
      return {
        success: false,
        error: "Esewa payment will come soon, please do start with Khalti.",
      };
    }

    if (!paymentData.success) {
      return {
        success: false,
        message: "Failed to initiate payment",
      };
    }

    return {
      success: true,
      message: "Booking created successfully",
      data: {
        bookingId: booking.id,
        payment: paymentData,
      },
    };
  } catch (error) {
    console.error("Booking initiation error:", error);
    return {
      success: false,
      error: "Failed to create booking. Please try again.",
    };
  }
}

// Get user's bookings
export async function getUserBookings(userId?: string) {
  try {
    const session = await auth();
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: targetUserId,
      },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            type: true,
            image: true,
            pricePerDay: true,
          },
        },
      },
      orderBy: {
        bookedAt: "desc",
      },
    });

    return {
      success: true,
      bookings,
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      success: false,
      error: "Failed to fetch bookings",
    };
  }
}

// Get single booking by ID
export async function getBookingById(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        listing: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Check if user owns this booking
    if (booking.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to view this booking",
      };
    }

    return {
      success: true,
      booking,
    };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      error: "Failed to fetch booking details",
    };
  }
}

// Complete a pending booking (retry payment)
export async function completeBooking(bookingId: string) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    // 2. Get the booking with listing details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
            select: {
                id: true,
                name: true,
                isAvailable: true,
            }
        },
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // 3. Check if user owns this booking
    if (booking.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to complete this booking",
      };
    }

    // 4. Check if already paid
    if (booking.isPaid) {
      return {
        success: false,
        error: "This booking is already paid",
      };
    }

    // 5. Check if booking is in pending status
    if (booking.status !== "Pending") {
      return {
        success: false,
        error: `Cannot complete payment for a ${booking.status.toLowerCase()} booking`,
      };
    }

    // 6. Check if booking has expired
    if (booking.expiredAt && new Date() > new Date(booking.expiredAt)) {
      return {
        success: false,
        error: "This booking has expired. Please create a new booking.",
      };
    }

    // 7. Check if listing is still available
    if (!booking.listing.isAvailable) {
      return {
        success: false,
        error: "This vehicle is no longer available for booking",
      };
    }

    // 8. Re-check for date conflicts (someone might have booked in the meantime)
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        listingId: booking.listingId,
        id: { not: bookingId }, // Exclude current booking
        status: {
          in: ["Confirmed", "Active"],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: booking.startDate } },
              { endDate: { gte: booking.startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: booking.endDate } },
              { endDate: { gte: booking.endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: booking.startDate } },
              { endDate: { lte: booking.endDate } },
            ],
          },
        ],
      },
    });

    if (conflictingBookings) {
      return {
        success: false,
        error:
          "These dates are no longer available. Please cancel and create a new booking.",
      };
    }

    // 9. Initiate payment
    let paymentData: any = null;
    if (booking.paymentMethod === "Khalti") {
      paymentData = await initiateKhaltiPayment(booking.id);
    } else if (booking.paymentMethod === "Esewa") {
      return {
        success: false,
        error: "Esewa payment will come soon, please contact support.",
      };
    } else {
      return {
        success: false,
        error: "Invalid payment method",
      };
    }

    if (!paymentData.success) {
      return {
        success: false,
        error: "Failed to initiate payment. Please try again.",
      };
    }

    return {
      success: true,
      message: "Payment initiated successfully",
      data: {
        bookingId: booking.id,
        payment: paymentData,
      },
    };
  } catch (error) {
    console.error("Complete booking error:", error);
    return {
      success: false,
      error: "Failed to complete booking. Please try again.",
    };
  }
}

// Cancel a booking
export async function cancelBooking(bookingId: string, reason?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to cancel a booking",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Check if user owns this booking
    if (booking.userId !== session.user.id) {
      return {
        success: false,
        error: "You can only cancel your own bookings",
      };
    }

    // Check if booking can be cancelled
    if (booking.status === "Completed" || booking.status === "Cancelled") {
      return {
        success: false,
        error: `Cannot cancel a ${booking.status.toLowerCase()} booking`,
      };
    }

    // Check if booking is active (ongoing)
    if (booking.status === "Active") {
      return {
        success: false,
        error: "Cannot cancel an active booking. Please contact support.",
      };
    }

    let refundStatus: "Pending" | "Processed" | "Failed" | null = null;
    let refundAmount: number | null = null;

    if (booking.isPaid) {
      if (booking.paymentMethod !== "Khalti") {
        return {
          success: false,
          error: "Only Khalti paid bookings can be auto-refunded right now.",
        };
      }

      const pidx = booking.khaltiPidx;
      if (!pidx) {
        return {
          success: false,
          error: "Payment reference not found for refund.",
        };
      }

      const refundResult = await refundKhaltiPaymentByPidx(pidx);

      if (!refundResult.success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            refundStatus: "Failed",
          },
        });

        return {
          success: false,
          error: refundResult.message || "Refund failed. Booking not cancelled.",
        };
      }

      refundStatus = "Processed";
      refundAmount = booking.totalPrice;
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "Cancelled",
        cancelledAt: new Date(),
        cancelledBy: session.user.id,
        cancellationReason: reason,
        refundStatus,
        refundAmount,
      },
    });

    return {
      success: true,
      message: booking.isPaid
        ? "Booking cancelled and full refund processed successfully"
        : "Booking cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: "Failed to cancel booking. Please try again.",
    };
  }
}

interface SearchBookingsParams {
  limit?: number;
  page?: number;
}

export async function searchBookings(params: SearchBookingsParams) {
  const { limit = 10, page = 1 } = params;

  const skip = (page - 1) * limit;

  const total = await prisma.booking.count();

  const bookings = await prisma.booking.findMany({
    skip,
    take: limit,
    orderBy: {
      bookedAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      listing: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return {
    bookings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============ ADMIN BOOKING ACTIONS ============

// Admin: Confirm a pending booking
export async function confirmBooking(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Check if booking is in Pending status
    if (booking.status !== "Pending") {
      return {
        success: false,
        error: `Cannot confirm a ${booking.status.toLowerCase()} booking`,
      };
    }

    // Update booking status to Confirmed
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "Confirmed",
      },
    });

    return {
      success: true,
      message: "Booking confirmed successfully",
    };
  } catch (error) {
    console.error("Error confirming booking:", error);
    return {
      success: false,
      error: "Failed to confirm booking. Please try again.",
    };
  }
}

// Admin: Mark booking as Active (rental in progress)
export async function markBookingAsActive(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Check if booking is in Confirmed status
    if (booking.status !== "Confirmed") {
      return {
        success: false,
        error: `Cannot mark a ${booking.status.toLowerCase()} booking as active. Only confirmed bookings can be marked as active.`,
      };
    }

    // Update booking status to Active
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "Active",
      },
    });

    return {
      success: true,
      message: "Booking marked as active successfully",
    };
  } catch (error) {
    console.error("Error marking booking as active:", error);
    return {
      success: false,
      error: "Failed to mark booking as active. Please try again.",
    };
  }
}

// Admin: Mark booking as Completed
export async function markBookingAsCompleted(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Check if booking is in Active status
    if (booking.status !== "Active") {
      return {
        success: false,
        error: `Cannot mark a ${booking.status.toLowerCase()} booking as completed. Only active bookings can be completed.`,
      };
    }

    // Update booking status to Completed
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "Completed",
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Booking marked as completed successfully",
    };
  } catch (error) {
    console.error("Error marking booking as completed:", error);
    return {
      success: false,
      error: "Failed to mark booking as completed. Please try again.",
    };
  }
}

// Admin: Cancel booking (with refund if paid)
export async function adminCancelBooking(bookingId: string, reason?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Check if booking can be cancelled
    if (booking.status === "Completed" || booking.status === "Cancelled") {
      return {
        success: false,
        error: `Cannot cancel a ${booking.status.toLowerCase()} booking`,
      };
    }

    // Check if booking is active - admin can still cancel but needs confirmation
    if (booking.status === "Active") {
      return {
        success: false,
        error: "Cannot cancel an active booking. The rental is already in progress.",
      };
    }

    let refundStatus: "Pending" | "Processed" | "Failed" | null = null;
    let refundAmount: number | null = null;

    // Handle refund if payment was made
    if (booking.isPaid) {
      if (booking.paymentMethod !== "Khalti") {
        return {
          success: false,
          error: "Only Khalti paid bookings can be auto-refunded right now.",
        };
      }

      const pidx = booking.khaltiPidx;
      if (!pidx) {
        return {
          success: false,
          error: "Payment reference not found for refund.",
        };
      }

      const refundResult = await refundKhaltiPaymentByPidx(pidx);

      if (!refundResult.success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            refundStatus: "Failed",
          },
        });

        return {
          success: false,
          error: refundResult.message || "Refund failed. Booking not cancelled.",
        };
      }

      refundStatus = "Processed";
      refundAmount = booking.totalPrice;
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "Cancelled",
        cancelledAt: new Date(),
        cancelledBy: session.user.id,
        cancellationReason: reason,
        refundStatus,
        refundAmount,
      },
    });

    return {
      success: true,
      message: booking.isPaid
        ? "Booking cancelled and full refund processed successfully"
        : "Booking cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: "Failed to cancel booking. Please try again.",
    };
  }
}
