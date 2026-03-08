import ListingPageClient from "@/components/listing/ListingPageClient";
import { Skeleton } from "@/components/ui/skeleton";
import { getListingById } from "@/lib/actions/listing";
import Link from "next/link";
import React, { Suspense } from "react";

function VehiclePageSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* title and share */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-3/4" />
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      {/* Image Grid Skeleton */}
      <div className="relative w-full grid grid-cols-4 grid-rows-2 gap-2 h-100 overflow-hidden rounded-2xl">
        {/* Main Image */}
        <Skeleton className="col-span-2 row-span-2" />

        {/* Thumbnails */}
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Location */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-4 mt-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Owner Info */}
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Specifications */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Description */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Rental Terms */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="bg-background rounded-lg p-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Reviews Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-56" />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="w-5 h-5" />
              </div>
              <Skeleton className="h-4 w-28" />
            </div>

            <div className="space-y-4 mt-6">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Skeleton key={star} className="w-4 h-4" />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                    {i < 3 && <div className="border-t border-border mt-6" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-24 space-y-4">
            {/* Share & Save Buttons */}
            <div className="flex items-center justify-center w-full gap-x-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>

            {/* Booking Card */}
            <div className="p-6 border border-border bg-card shadow-lg rounded-2xl space-y-6">
              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-40" />
              </div>

              <div className="border-t border-border" />

              {/* Date Pickers */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-36" />
                <div className="flex items-center gap-x-2">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </div>
              <div className="border-t border-border" />

              {/* Book Button */}
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-5 w-full rounded-lg" />
            </div>

            {/* Report Button */}
            <Skeleton className="h-8 w-40 mx-auto rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface VehiclePageProps {
  params: Promise<{
    id: string;
  }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function VehiclePageSection({ params }: VehiclePageProps) {
  const allParams = await params;
  const vehicleId = allParams.id;
  try {
    const listing = await getListingById(vehicleId);

    if (!listing) {
      return (
        <div className="h-100 flex flex-col items-center justify-center py-12">
          <p className="text-destructive mb-4">
            This vehicle is no longer available!
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go back to search
          </Link>
        </div>
      );
    }

    return (
      <>
        <ListingPageClient details={listing} vehicleId={listing.id}/>
      </>
    );
  } catch (error) {
    return (
      <div className="h-100 flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Failed to load vehicle details!</p>
        <Link
          href={`/listing/${vehicleId}`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </Link>
      </div>
    );
  }
}

const page = async ({ params }: VehiclePageProps) => {
  const allParams = await params;
  return (
    <Suspense fallback={<VehiclePageSkeleton />}>
      <VehiclePageSection params={params} />
    </Suspense>
  );
};

export default page;
