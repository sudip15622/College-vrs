"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import { FaCheckCircle, FaClock, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";

interface Booking {
  id: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  renterContactNumber: string;
  expiredAt: Date | null;
  listing: {
    id: string;
    name: string;
    type: string;
    image: any;
    pricePerDay: number;
  };
  bookedAt: Date;
}

interface TripsPageClientProps {
  bookings: Booking[];
}

const TripsPageClient = ({ bookings }: TripsPageClientProps) => {
  const [filter, setFilter] = useState<"all" | "pending" | "upcoming" | "active" | "completed" | "cancelled">("all");

  const isBookingExpired = (booking: Booking) => {
    if (!booking.expiredAt || booking.isPaid || booking.status !== "Pending") {
      return false;
    }
    return new Date(booking.expiredAt) < new Date();
  };

  const getTimeUntilExpiry = (expiredAt: Date) => {
    const now = new Date().getTime();
    const expiryTime = new Date(expiredAt).getTime();
    const diff = expiryTime - now;

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m left`;
    }
    return `${minutes}m left`;
  };

  const getStatusBadge = (status: string, isPaid: boolean) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      Pending: {
        label: isPaid ? "Payment Pending" : "Awaiting Payment",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        icon: FaClock,
      },
      Confirmed: {
        label: "Confirmed",
        color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        icon: FaCheckCircle,
      },
      Active: {
        label: "Active",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        icon: FaSpinner,
      },
      Completed: {
        label: "Completed",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
        icon: MdCheckCircle,
      },
      Cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        icon: FaTimesCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;

    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    if (filter === "pending") {
      return booking.status === "Pending";
    }
    if (filter === "upcoming") {
      return booking.status === "Confirmed";
    }
    if (filter === "active") {
      return booking.status === "Active";
    }
    if (filter === "completed") {
      return booking.status === "Completed";
    }
    if (filter === "cancelled") {
      return booking.status === "Cancelled";
    }
    return true;
  });

  const stats = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    upcoming: bookings.filter((b) => {
      return b.status === "Confirmed";
    }).length,
    active: bookings.filter((b) => {
      return b.status === "Active";
    }).length,
    completed: bookings.filter((b) => b.status === "Completed").length,
    cancelled: bookings.filter((b) => b.status === "Cancelled").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Trips</h1>
        <p className="text-muted-foreground">
          Manage and view all your vehicle bookings
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-border">
        {[
          { key: "all" as const, label: "All Trips" },
          { key: "pending" as const, label: "Payment Pending" },
          { key: "upcoming" as const, label: "Upcoming" },
          { key: "active" as const, label: "Active" },
          { key: "completed" as const, label: "Completed" },
          { key: "cancelled" as const, label: "Cancelled" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer flex items-center ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-primary/20"
            }`}
          >
            {label}
            {stats[key] > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-background/10 rounded-full text-xs">
                {stats[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MdCancel className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No trips found</h3>
          <p className="text-muted-foreground mb-6">
            {filter === "all"
              ? "You haven't made any bookings yet."
              : `You don't have any ${filter} trips.`}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
          >
            Browse Vehicles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/trips/${booking.id}`}
              className="block group"
            >
              <div className="bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all duration-200">
                <div className="flex gap-4">
                  {/* Vehicle Image */}
                  <div className="w-32 h-24 relative overflow-hidden rounded-lg bg-border shrink-0">
                    <Image
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                      src={booking.listing.image?.url || "/type_bike.png"}
                      alt={booking.listing.name}
                      fill
                      sizes="128px"
                      unoptimized
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {booking.listing.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.listing.type}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(booking.status, booking.isPaid)}
                        {booking.status === "Pending" && !booking.isPaid && booking.expiredAt && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            isBookingExpired(booking)
                              ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}>
                            ⏱️ {getTimeUntilExpiry(booking.expiredAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Pickup</p>
                        <p className="font-medium text-sm">
                          {format(new Date(booking.startDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Dropoff</p>
                        <p className="font-medium text-sm">
                          {format(new Date(booking.endDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="font-medium text-sm">
                          {booking.totalDays} {booking.totalDays === 1 ? "day" : "days"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Price</p>
                        <p className="font-medium text-sm flex items-center gap-0.5">
                          <TbCurrencyRupeeNepalese className="w-3.5 h-3.5" />
                          {booking.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Booked on {format(new Date(booking.bookedAt), "MMM dd, yyyy 'at' hh:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsPageClient;
