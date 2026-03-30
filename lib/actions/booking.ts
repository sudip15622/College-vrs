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

    if (!session.user.emailVerified) {
      return {
        success: false,
        error: "Please verify your email before booking vehicles.",
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

    if (!session.user.emailVerified) {
      return {
        success: false,
        error: "Please verify your email before making payments.",
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

    if (!session.user.emailVerified) {
      return {
        success: false,
        error: "Please verify your email before cancelling bookings.",
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

export interface RevenueTrendDataPoint {
  date: string;
  revenue: number;
}

export interface RevenueByVehicleDataPoint {
  vehicle: string;
  revenue: number;
}

export interface BookingTrendDataPoint {
  date: string;
  bookings: number;
}

export interface BookingStatusDistributionDataPoint {
  status: "Pending" | "Confirmed" | "Active" | "Completed" | "Cancelled";
  count: number;
}

export interface TopVehiclesByBookingsDataPoint {
  vehicle: string;
  bookings: number;
}

export interface DashboardStatsData {
  totalVehicles: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getDashboardStatsData(): Promise<DashboardStatsData> {
  const [totalVehicles, totalBookings, totalUsers, revenueAggregate] =
    await Promise.all([
      prisma.listing.count(),
      prisma.booking.count(),
      prisma.user.count(),
      prisma.booking.aggregate({
        where: {
          isPaid: true,
          status: {
            not: "Cancelled",
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

  return {
    totalVehicles,
    totalBookings,
    totalUsers,
    totalRevenue: revenueAggregate._sum.totalPrice ?? 0,
  };
}

export async function getRevenueTrendData(days = 90): Promise<RevenueTrendDataPoint[]> {
  const safeDays = Math.max(1, days);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (safeDays - 1));

  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      isPaid: true,
      status: {
        not: "Cancelled",
      },
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      paidAt: true,
      totalPrice: true,
    },
  });

  const revenueByDate = new Map<string, number>();

  for (let index = 0; index < safeDays; index++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    revenueByDate.set(getDateKey(date), 0);
  }

  for (const booking of bookings) {
    if (!booking.paidAt) {
      continue;
    }

    const dateKey = getDateKey(booking.paidAt);
    const currentRevenue = revenueByDate.get(dateKey) ?? 0;
    revenueByDate.set(dateKey, currentRevenue + booking.totalPrice);
  }

  return Array.from(revenueByDate.entries()).map(([dateKey, revenue]) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue,
    };
  });
}

export async function getRevenueByVehicleData(
  limit = 6,
  days?: number,
): Promise<RevenueByVehicleDataPoint[]> {
  const safeLimit = Math.max(1, limit);

  const whereClause: {
    isPaid: boolean;
    status: {
      not: "Cancelled";
    };
    paidAt?: {
      gte: Date;
      lte: Date;
    };
  } = {
    isPaid: true,
    status: {
      not: "Cancelled",
    },
  };

  if (typeof days === "number") {
    const safeDays = Math.max(1, days);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (safeDays - 1));

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    whereClause.paidAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const revenueByListing = await prisma.booking.groupBy({
    by: ["listingId"],
    where: whereClause,
    _sum: {
      totalPrice: true,
    },
    orderBy: {
      _sum: {
        totalPrice: "desc",
      },
    },
    take: safeLimit,
  });

  if (!revenueByListing.length) {
    return [];
  }

  const listingIds = revenueByListing.map((entry) => entry.listingId);
  const listings = await prisma.listing.findMany({
    where: {
      id: {
        in: listingIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const listingNameById = new Map(listings.map((listing) => [listing.id, listing.name]));

  return revenueByListing.map((entry) => ({
    vehicle: listingNameById.get(entry.listingId) || "Unknown Vehicle",
    revenue: entry._sum.totalPrice || 0,
  }));
}

export async function getBookingTrendData(days = 30): Promise<BookingTrendDataPoint[]> {
  const safeDays = Math.max(1, days);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (safeDays - 1));

  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      bookedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      bookedAt: true,
    },
  });

  const bookingsByDate = new Map<string, number>();

  for (let index = 0; index < safeDays; index++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    bookingsByDate.set(getDateKey(date), 0);
  }

  for (const booking of bookings) {
    const dateKey = getDateKey(booking.bookedAt);
    const currentCount = bookingsByDate.get(dateKey) ?? 0;
    bookingsByDate.set(dateKey, currentCount + 1);
  }

  return Array.from(bookingsByDate.entries()).map(([dateKey, bookingsCount]) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      bookings: bookingsCount,
    };
  });
}

export async function getBookingStatusDistributionData(
  days = 30,
): Promise<BookingStatusDistributionDataPoint[]> {
  const safeDays = Math.max(1, days);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (safeDays - 1));

  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  const groupedStatuses = await prisma.booking.groupBy({
    by: ["status"],
    where: {
      bookedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      _all: true,
    },
  });

  const statusOrder: BookingStatusDistributionDataPoint["status"][] = [
    "Pending",
    "Confirmed",
    "Active",
    "Completed",
    "Cancelled",
  ];

  const statusCountMap = new Map(
    groupedStatuses.map((entry) => [entry.status, entry._count._all]),
  );

  return statusOrder.map((status) => ({
    status,
    count: statusCountMap.get(status) ?? 0,
  }));
}

export async function getTopVehiclesByBookingsData(
  days = 30,
  limit = 6,
): Promise<TopVehiclesByBookingsDataPoint[]> {
  const safeDays = Math.max(1, days);
  const safeLimit = Math.max(1, limit);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (safeDays - 1));

  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  const bookingsByListing = await prisma.booking.groupBy({
    by: ["listingId"],
    where: {
      bookedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      listingId: true,
    },
    orderBy: {
      _count: {
        listingId: "desc",
      },
    },
    take: safeLimit,
  });

  if (!bookingsByListing.length) {
    return [];
  }

  const listingIds = bookingsByListing.map((entry) => entry.listingId);
  const listings = await prisma.listing.findMany({
    where: {
      id: {
        in: listingIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const listingNameById = new Map(listings.map((listing) => [listing.id, listing.name]));

  return bookingsByListing.map((entry) => ({
    vehicle: listingNameById.get(entry.listingId) || "Unknown Vehicle",
    bookings: entry._count.listingId,
  }));
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
