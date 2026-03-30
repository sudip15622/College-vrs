import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import BookingPageClient from "@/components/booking/BookingPageClient";
import { auth } from "@/auth";
import { getListingById } from "@/lib/actions/listing";

interface BookingPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

async function BookingPageSection({ params, searchParams }: BookingPageProps) {
  const allParams = await params;
  const allSearchParams = await searchParams;
  const vehicleId = allParams.id;

  const session = await auth();

  // Build the return URL with search params
  const returnUrl = `/book/vehicles/${vehicleId}`;
  const searchParamsString = new URLSearchParams();

  if (allSearchParams.from) searchParamsString.set("from", allSearchParams.from);
  if (allSearchParams.to) searchParamsString.set("to", allSearchParams.to);

  const fullReturnUrl = searchParamsString.toString()
    ? `${returnUrl}?${searchParamsString.toString()}`
    : returnUrl;

  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(fullReturnUrl)}`);
    return null;
  }

  if (!session.user.emailVerified) {
    redirect(`/verify-email?returnTo=${encodeURIComponent(fullReturnUrl)}`);
    return null;
  }

  try {
    const listing = await getListingById(vehicleId);

    if (!listing) {
      return (
        <div className="h-100 flex flex-col items-center justify-center py-12">
          <p className="text-destructive mb-4">
            This vehicle is no longer available!
          </p>
          <Link
            href="/search"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go back to search
          </Link>
        </div>
      );
    }

    return (
      <BookingPageClient
        vehicle={listing}
        // user={user}
        pickupDate={allSearchParams.from}
        dropoffDate={allSearchParams.to}
      />
    );
  } catch (error) {
    return (
      <div className="h-100 flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Failed to load details!</p>
        <Link
          href={`/vehicles/${vehicleId}`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go back
        </Link>
      </div>
    );
  }
}

function BookingPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

const page = async ({ params, searchParams }: BookingPageProps) => {
  return (
    <Suspense fallback={<BookingPageSkeleton />}>
      <BookingPageSection params={params} searchParams={searchParams} />
    </Suspense>
  );
};

export default page;
