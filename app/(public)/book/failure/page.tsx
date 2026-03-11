import { Suspense } from "react";
import Link from "next/link";
import { MdErrorOutline } from "react-icons/md";
import { getBookingById, cancelBooking } from "@/lib/actions/booking";
import { Skeleton } from "@/components/ui/skeleton";

interface FailurePageProps {
  searchParams: Promise<{
    booking_id?: string;
    error?: string;
  }>;
}

async function FailureContent({ searchParams }: FailurePageProps) {
  const params = await searchParams;
  const bookingId = params.booking_id;
  const errorType = params.error;

  let errorMessage = "Payment failed. Please try again.";
  
  if (errorType === "missing_params") {
    errorMessage = "Invalid payment callback. Missing required parameters.";
  } else if (errorType === "server_error") {
    errorMessage = "Server error occurred. Please try again later.";
  }

  // If we have a booking ID, try to cancel it
  if (bookingId) {
    const result = await getBookingById(bookingId);
    
    if (result.success && result.booking) {
      // Auto-cancel the failed booking
      if (result.booking.status === "Pending") {
        await cancelBooking(bookingId, "Payment failed");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg p-8 space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <MdErrorOutline className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Payment Failed
          </h1>
          <p className="text-muted-foreground">
            {errorMessage}
          </p>
        </div>

        {/* Information Box */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            What happened?
          </h4>
          <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <li>• Your booking was not confirmed</li>
            <li>• No charges were made to your account</li>
            <li>• You can try booking again</li>
          </ul>
        </div>

        {/* Common Issues */}
        <div className="border border-border rounded-xl p-4">
          <h4 className="font-semibold mb-3">Common issues:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Insufficient balance in your wallet</li>
            <li>• Incorrect PIN or password</li>
            <li>• Network connectivity issues</li>
            <li>• Payment timeout</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          {bookingId && (
            <Link
              href={`/vehicles/${bookingId.split('-')[0]}`}
              className="w-full px-6 py-3 bg-primary text-primary-foreground text-center rounded-full hover:bg-primary/90 transition-colors font-medium"
            >
              Try Again
            </Link>
          )}
          <Link
            href="/"
            className="w-full px-6 py-3 bg-secondary text-secondary-foreground text-center rounded-full hover:bg-secondary/90 transition-colors font-medium"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="text-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Need help? Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

function FailurePageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Skeleton className="h-20 w-20 rounded-full mx-auto" />
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

const page = async ({ searchParams }: FailurePageProps) => {
  return (
    <Suspense fallback={<FailurePageSkeleton />}>
      <FailureContent searchParams={searchParams} />
    </Suspense>
  );
};

export default page;
