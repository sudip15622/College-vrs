import { Suspense } from "react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import { getBookingById } from "@/lib/actions/booking";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface SuccessPageProps {
  searchParams: Promise<{
    booking_id?: string;
  }>;
}

async function SuccessContent({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const bookingId = params.booking_id;

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Booking ID not found</p>
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const result = await getBookingById(bookingId);

  if (!result.success || !result.booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Booking not found</p>
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const { booking } = result;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-lg p-8 space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <FaCheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Your booking has been confirmed. We've sent the details to your email.
          </p>
        </div>

        {/* Booking Details */}
        <div className="border border-border rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start pb-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-lg">{booking.listing.name}</h3>
              <p className="text-sm text-muted-foreground">
                {booking.listing.type}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <p className="font-mono text-sm">{booking.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pickup Date</p>
              <p className="font-medium">
                {format(new Date(booking.startDate), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dropoff Date</p>
              <p className="font-medium">
                {format(new Date(booking.endDate), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">
                {booking.totalDays} {booking.totalDays === 1 ? "day" : "days"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium flex items-center gap-0.5">
                <TbCurrencyRupeeNepalese className="size-4" />
                {booking.totalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Contact Number</p>
            <p className="font-medium">+977 {booking.renterContactNumber}</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What's Next?
          </h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• The vehicle owner will contact you on your number</li>
            <li>• Confirm the pickup location and time</li>
            <li>• Bring a valid ID and driving license</li>
            <li>• Inspect the vehicle before taking it</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Link
            href="/trips"
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground text-center rounded-full hover:bg-primary/90 transition-colors font-medium"
          >
            View My Trips
          </Link>
          <Link
            href="/"
            className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground text-center rounded-full hover:bg-secondary/90 transition-colors font-medium"
          >
            Browse More
          </Link>
        </div>
      </div>
    </div>
  );
}

function SuccessPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Skeleton className="h-20 w-20 rounded-full mx-auto" />
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1 rounded-full" />
          <Skeleton className="h-12 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}

const page = async ({ searchParams }: SuccessPageProps) => {
  return (
    <Suspense fallback={<SuccessPageSkeleton />}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
};

export default page;
