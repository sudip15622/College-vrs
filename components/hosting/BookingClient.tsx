"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  User,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  confirmBooking,
  markBookingAsActive,
  markBookingAsCompleted,
  adminCancelBooking,
} from "@/lib/actions/booking";
import Confirmation from "@/components/confirmation/Confirmation";

interface Booking {
  id: string;
  userId: string;
  listingId: string;
  startDate: Date;
  endDate: Date;
  pricePerDay: number;
  totalDays: number;
  totalPrice: number;
  renterContactNumber: string;
  renterNotes: string | null;
  paymentMethod: string | null;
  isPaid: boolean;
  paidAt: Date | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  refundAmount: number | null;
  refundStatus: string | null;
  status: string;
  bookedAt: Date;
  updatedAt: Date;
  expiredAt: Date | null;
  khaltiPidx: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  listing: {
    id: string;
    name: string;
    type: string;
    image: { url?: string } | null;
    fuelType: string;
    transmission: string;
    condition: string;
    pricePerDay: number;
  };
}

interface BookingClientProps {
  booking: Booking;
}

const statusMap: Record<
  string,
  {
    label: string;
    textClass: string;
    bgClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Pending: {
    label: "Payment Pending",
    textClass: "text-yellow-700 dark:text-yellow-400",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/20",
    icon: Clock,
  },
  Confirmed: {
    label: "Confirmed",
    textClass: "text-green-700 dark:text-green-400",
    bgClass: "bg-green-100 dark:bg-green-900/20",
    icon: CheckCircle2,
  },
  Active: {
    label: "Active Rental",
    textClass: "text-blue-700 dark:text-blue-400",
    bgClass: "bg-blue-100 dark:bg-blue-900/20",
    icon: MapPin,
  },
  Completed: {
    label: "Completed",
    textClass: "text-muted-foreground",
    bgClass: "bg-muted",
    icon: CheckCircle2,
  },
  Cancelled: {
    label: "Cancelled",
    textClass: "text-red-700 dark:text-red-400",
    bgClass: "bg-red-100 dark:bg-red-900/20",
    icon: XCircle,
  },
};

const BookingClient = ({ booking }: BookingClientProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<
    "confirm" | "active" | "complete" | "cancel" | null
  >(null);
  const router = useRouter();

  const listingImage = booking.listing.image as { url?: string } | null;
  const statusConfig = statusMap[booking.status] ?? statusMap.Pending;
  const StatusIcon = statusConfig.icon;

  const handleConfirmBooking = async () => {
    setIsLoading("confirm");
    try {
      const result = await confirmBooking(booking.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
        throw new Error(result.error || "Failed to confirm booking");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while confirming the booking");
      throw error;
    } finally {
      setIsLoading(null);
    }
  };

  const handleMarkActive = async () => {
    setIsLoading("active");
    try {
      const result = await markBookingAsActive(booking.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
        throw new Error(result.error || "Failed to mark booking as active");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while marking the booking as active");
      throw error;
    } finally {
      setIsLoading(null);
    }
  };

  const handleMarkCompleted = async () => {
    setIsLoading("complete");
    try {
      const result = await markBookingAsCompleted(booking.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
        throw new Error(result.error || "Failed to mark booking as completed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while marking the booking as completed");
      throw error;
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancelBooking = async () => {
    setIsLoading("cancel");
    try {
      const result = await adminCancelBooking(booking.id, "Cancelled by admin");
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
        throw new Error(result.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while cancelling the booking");
      throw error;
    } finally {
      setIsLoading(null);
    }
  };

  const getConfirmationConfig = () => {
    if (activeAction === "confirm") {
      return {
        title: "Confirm Booking?",
        description:
          "This will confirm the booking and move it to confirmed status.",
        actionButtonName: "Confirm Booking",
        actionFunction: handleConfirmBooking,
        isDangerous: false,
      };
    }

    if (activeAction === "active") {
      return {
        title: "Mark Booking as Active?",
        description:
          "Use this when the customer has picked up the vehicle and the rental has started.",
        actionButtonName: "Mark as Active",
        actionFunction: handleMarkActive,
        isDangerous: false,
      };
    }

    if (activeAction === "complete") {
      return {
        title: "Mark Booking as Completed?",
        description:
          "Use this when the rental is finished and the vehicle is returned.",
        actionButtonName: "Mark as Completed",
        actionFunction: handleMarkCompleted,
        isDangerous: false,
      };
    }

    if (activeAction === "cancel") {
      return {
        title: "Cancel Booking?",
        description: booking.isPaid
          ? "Are you sure you want to cancel this booking? A full refund will be processed to the customer's original Khalti payment method."
          : "Are you sure you want to cancel this booking?",
        actionButtonName: "Cancel Booking",
        actionFunction: handleCancelBooking,
        isDangerous: true,
      };
    }

    return null;
  };

  const confirmationConfig = getConfirmationConfig();

  return (
    <div className="max-w-6xl space-y-6">
      <div className="space-y-3">
        <Link
          href="/hosting/bookings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Link>

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Booking Details</h1>
            <p className="text-sm text-muted-foreground mt-1">ID: {booking.id}</p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${statusConfig.bgClass}`}
          >
            <StatusIcon className={`h-4 w-4 ${statusConfig.textClass}`} />
            <span className={`text-sm font-medium ${statusConfig.textClass}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Renter Details
            </h2>
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border">
                <Image
                  src={booking.user.image || "/default_user.png"}
                  alt={booking.user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-base">{booking.user.name}</p>
                <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  +977 {booking.renterContactNumber}
                </p>
              </div>
            </div>
            {booking.renterNotes && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Renter Note
                </p>
                <p className="text-sm">{booking.renterNotes}</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Vehicle Details</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative h-32 sm:h-28 sm:w-44 w-full shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                <Image
                  src={listingImage?.url || "/vehicle.jfif"}
                  alt={booking.listing.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{booking.listing.name}</h3>
                <p className="text-sm text-muted-foreground">{booking.listing.type}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {booking.listing.fuelType}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {booking.listing.transmission}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {booking.listing.condition}
                  </span>
                </div>
                <Link
                  href={`/hosting/listings/${booking.listing.id}`}
                  className="inline-block pt-2 text-sm text-primary hover:underline"
                >
                  View listing details
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rental Period
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Pickup</p>
                <p className="font-medium">{format(new Date(booking.startDate), "EEEE")}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.startDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Dropoff</p>
                <p className="font-medium">{format(new Date(booking.endDate), "EEEE")}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.endDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Total Duration: <span className="font-medium text-foreground">{booking.totalDays} {booking.totalDays === 1 ? "day" : "days"}</span>
            </p>
          </section>

          {booking.status === "Cancelled" && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
              <h2 className="mb-4 text-xl font-semibold text-red-700 dark:text-red-400">
                Cancellation Details
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Cancelled On: </span>
                  {booking.cancelledAt
                    ? format(new Date(booking.cancelledAt), "MMM dd, yyyy 'at' hh:mm a")
                    : "-"}
                </p>
                {booking.cancellationReason && (
                  <p>
                    <span className="text-muted-foreground">Reason: </span>
                    {booking.cancellationReason}
                  </p>
                )}
                {booking.refundStatus && (
                  <p>
                    <span className="text-muted-foreground">Refund Status: </span>
                    {booking.refundStatus}
                  </p>
                )}
                {booking.refundAmount !== null && (
                  <p>
                    <span className="text-muted-foreground">Refund Amount: </span>
                    ₹{booking.refundAmount.toLocaleString()}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6 lg:col-span-1">
          <section className="sticky top-6 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Price Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>
                  ₹{booking.pricePerDay.toLocaleString()} × {booking.totalDays} {booking.totalDays === 1 ? "day" : "days"}
                </span>
                <span>₹{booking.totalPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>₹{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-border pt-4 space-y-1">
              <p className="text-xs text-muted-foreground">Payment Status</p>
              <p className={`text-sm font-medium ${booking.isPaid ? "text-green-600" : "text-yellow-600"}`}>
                {booking.isPaid ? "Paid" : "Pending"}
              </p>
              {booking.paymentMethod && (
                <p className="text-xs text-muted-foreground">Method: {booking.paymentMethod}</p>
              )}
              {booking.paidAt && (
                <p className="text-xs text-muted-foreground">
                  Paid on {format(new Date(booking.paidAt), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              )}
              {booking.expiredAt && !booking.isPaid && booking.status === "Pending" && (
                <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-950/20">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Expires {format(new Date(booking.expiredAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-border pt-4 space-y-1 text-xs text-muted-foreground">
              <p>Booked: {format(new Date(booking.bookedAt), "MMM dd, yyyy 'at' hh:mm a")}</p>
              <p>Last Updated: {format(new Date(booking.updatedAt), "MMM dd, yyyy 'at' hh:mm a")}</p>
            </div>

            <div className="mt-6 space-y-2">
              {booking.status === "Pending" && (
                <Button 
                  className="w-full" 
                  onClick={() => setActiveAction("confirm")}
                  disabled={isLoading === "confirm"}
                >
                  {isLoading === "confirm" ? "Confirming..." : "Confirm Booking"}
                </Button>
              )}
              {booking.status === "Confirmed" && (
                <Button 
                  className="w-full" 
                  onClick={() => setActiveAction("active")}
                  disabled={isLoading === "active"}
                >
                  {isLoading === "active" ? "Updating..." : "Mark as Active"}
                </Button>
              )}
              {(booking.status === "Active" || booking.status === "Confirmed") && (
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => setActiveAction("complete")}
                  disabled={isLoading === "complete"}
                >
                  {isLoading === "complete" ? "Updating..." : "Mark as Completed"}
                </Button>
              )}
              {booking.status !== "Completed" && booking.status !== "Cancelled" && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setActiveAction("cancel")}
                  disabled={isLoading === "cancel"}
                >
                  {isLoading === "cancel" ? "Cancelling..." : "Cancel Booking"}
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>

      {confirmationConfig && (
        <Confirmation
          isOpen={activeAction !== null}
          onClose={() => setActiveAction(null)}
          title={confirmationConfig.title}
          description={confirmationConfig.description}
          actionButtonName={confirmationConfig.actionButtonName}
          actionFunction={confirmationConfig.actionFunction}
          isDangerous={confirmationConfig.isDangerous}
        />
      )}
    </div>
  );
};

export default BookingClient;
