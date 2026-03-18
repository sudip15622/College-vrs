"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import { completeBooking, cancelBooking } from "@/lib/actions/booking";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaSpinner,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaExclamationTriangle
} from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdCheckCircle, MdDirectionsBike } from "react-icons/md";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  paidAt: Date | null;
  renterContactNumber: string;
  renterNotes: string | null;
  paymentMethod: string | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  refundAmount: number | null;
  refundStatus: string | null;
  expiredAt: Date | null;
  listing: {
    id: string;
    name: string;
    type: string;
    description: string;
    image: any;
    pricePerDay: number;
    fuelType: string;
    transmission: string;
    condition: string;
  };
  bookedAt: Date;
}

interface TripDetailsClientProps {
  booking: Booking;
}

const TripDetailsClient = ({ booking }: TripDetailsClientProps) => {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const handleCompletePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const result = await completeBooking(booking.id);
      
      if (result.success && result.data?.payment?.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = result.data.payment.payment_url;
      } else {
        toast.error(result.error || "Failed to initiate payment. Please try again.");
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Something went wrong. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  const handleCancelBooking = async () => {
    const confirmed = window.confirm(
      booking.isPaid
        ? "Are you sure you want to cancel this booking? A full refund will be processed to your original Khalti payment method."
        : "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const result = await cancelBooking(booking.id, "Cancelled by user");

      if (!result.success) {
        toast.error(result.error || "Failed to cancel booking.");
        return;
      }

      toast.success(result.message || "Booking cancelled successfully.");
      router.refresh();
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Something went wrong while cancelling booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Countdown timer for payment expiration
  useEffect(() => {
    if (!booking.expiredAt || booking.isPaid || booking.status !== "Pending") {
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(booking.expiredAt!).getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${minutes}m ${seconds}s`);
      setIsExpired(false);
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [booking.expiredAt, booking.isPaid, booking.status]);

  const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
      Pending: {
        label: "Payment Pending",
        color: "text-yellow-700 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        icon: FaClock,
      },
      Confirmed: {
        label: "Confirmed",
        color: "text-green-700 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/20",
        icon: FaCheckCircle,
      },
      Active: {
        label: "Active Rental",
        color: "text-blue-700 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        icon: MdDirectionsBike,
      },
      Completed: {
        label: "Completed",
        color: "text-gray-700 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-900/20",
        icon: MdCheckCircle,
      },
      Cancelled: {
        label: "Cancelled",
        color: "text-red-700 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        icon: FaTimesCircle,
      },
    };
    return config[status] || config.Pending;
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  const canCancel = booking.status === "Pending" || booking.status === "Confirmed";
  const canRetryPayment = booking.status === "Pending" && !booking.isPaid;

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6 relative">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <IoMdArrowRoundBack className="w-5 h-5" />
          Back to Trips
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trip Details</h1>
            <p className="text-muted-foreground">Booking ID: {booking.id.slice(0, 8)}</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${statusConfig.bgColor} flex items-center gap-2`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
            <span className={`font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Payment Expiration Warning */}
        {booking.status === "Pending" && !booking.isPaid && booking.expiredAt && (
          <div className="mt-4">
            {isExpired ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">
                      Payment Window Expired
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      This booking has expired. The payment window closed on{" "}
                      {format(new Date(booking.expiredAt), "MMM dd, yyyy 'at' hh:mm a")}.
                      This booking will be automatically cancelled.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaClock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                      Complete Payment Soon
                    </h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      Time remaining: <span className="font-semibold">{timeRemaining}</span>
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                      Payment expires on {format(new Date(booking.expiredAt), "MMM dd, yyyy 'at' hh:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
            <div className="flex gap-4">
              <div className="w-40 h-28 relative overflow-hidden rounded-lg bg-border shrink-0">
                <Image
                  className="object-cover w-full h-full"
                  src={booking.listing.image?.url || "/type_bike.png"}
                  alt={booking.listing.name}
                  fill
                  sizes="160px"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{booking.listing.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{booking.listing.type}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                    {booking.listing.fuelType}
                  </span>
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                    {booking.listing.transmission}
                  </span>
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                    {booking.listing.condition}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link
                href={`/vehicles/${booking.listing.id}`}
                className="text-sm text-primary hover:underline"
              >
                View vehicle details →
              </Link>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCalendarAlt className="w-5 h-5" />
              Rental Period
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pickup Date</p>
                <p className="text-lg font-semibold">
                  {format(new Date(booking.startDate), "EEEE")}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(booking.startDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dropoff Date</p>
                <p className="text-lg font-semibold">
                  {format(new Date(booking.endDate), "EEEE")}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(booking.endDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-lg font-semibold">
                {booking.totalDays} {booking.totalDays === 1 ? "day" : "days"}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaPhone className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Contact Number</p>
                <p className="font-medium">+977 {booking.renterContactNumber}</p>
              </div>
              {booking.renterNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Notes</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{booking.renterNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Info */}
          {booking.status === "Cancelled" && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-red-400">
                Cancellation Details
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled On</p>
                  <p className="font-medium">
                    {booking.cancelledAt && format(new Date(booking.cancelledAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
                {booking.cancellationReason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="text-sm">{booking.cancellationReason}</p>
                  </div>
                )}
                {booking.isPaid && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Refund Status</p>
                      <p className="text-sm font-medium">{booking.refundStatus || "Pending"}</p>
                    </div>
                    {booking.refundAmount !== null && (
                      <div>
                        <p className="text-sm text-muted-foreground">Refund Amount</p>
                        <p className="text-sm font-medium flex items-center gap-0.5">
                          <TbCurrencyRupeeNepalese className="w-3.5 h-3.5" />
                          {booking.refundAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Price Breakdown */}
          <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCreditCard className="w-5 h-5" />
              Price Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <TbCurrencyRupeeNepalese className="w-4 h-4" />
                  {booking.pricePerDay.toLocaleString()} x {booking.totalDays}{" "}
                  {booking.totalDays === 1 ? "day" : "days"}
                </span>
                <span className="flex items-center gap-0.5">
                  <TbCurrencyRupeeNepalese className="w-4 h-4" />
                  {booking.totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="flex items-center gap-0.5">
                    <TbCurrencyRupeeNepalese className="w-5 h-5" />
                    {booking.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Status</span>
                <span className={`text-sm font-medium ${booking.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {booking.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              {booking.isPaid && booking.paidAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Paid on {format(new Date(booking.paidAt), "MMM dd, yyyy")}
                </p>
              )}
              {booking.paymentMethod && (
                <p className="text-xs text-muted-foreground mt-1">
                  via {booking.paymentMethod}
                </p>
              )}
            </div>

            {/* Booked At */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Booked On</p>
              <p className="text-sm font-medium">
                {format(new Date(booking.bookedAt), "MMM dd, yyyy 'at' hh:mm a")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {canRetryPayment && (
                <>
                  {isExpired ? (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-xs text-red-800 dark:text-red-200">
                        Payment window expired. This booking will be cancelled automatically.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={handleCompletePayment}
                        disabled={isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          <>
                            <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Complete Payment"
                        )}
                      </Button>
                      {timeRemaining && (
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
                            ⏱️ {timeRemaining} remaining
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {canCancel && !isExpired && (
                <Button
                  className="w-full"
                  variant="destructive"
                  disabled={isCancelling}
                  onClick={handleCancelBooking}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Booking"}
                </Button>
              )}
              {booking.status === "Confirmed" && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    The owner will contact you before pickup to confirm details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsClient;
