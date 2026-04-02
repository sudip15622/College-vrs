import Link from "next/link";
import ListingCard from "@/components/listing/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecommendedListings } from "@/lib/actions/listing";

export function RecommendedVehiclesSkeleton() {
  return (
    <section className="w-full mx-auto py-12 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function RecommendedVehiclesSection() {
  const recommendedListings = await getRecommendedListings({ limit: 6 });

  if (!recommendedListings.length) {
    return (
      <section className="w-full mx-auto">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/40 px-6 py-10 text-center space-y-3">
          <h2 className="text-2xl font-semibold">Recommended Vehicles</h2>
          <p className="text-muted-foreground max-w-2xl">
            Recommendations will appear here once vehicles are available.
          </p>
          <Link
            href="/search"
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse all vehicles
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full mx-auto space-y-8">
      <div className="flex items-center justify-center flex-col gap-2">
        <div className="flex flex-col items-center justify-center text-center gap-1">
          <h2 className="text-3xl font-bold">Recommended Vehicles</h2>
          <p className="text-muted-foreground text-center">
            Ranked with our in-house relevance algorithm using popularity, rating,
            value, freshness, and user preference signals.
          </p>
        </div>
        <Link href="/search" className="text-sm font-medium underline underline-offset-4">
          View all
        </Link>
      </div>

      <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-row gap-6 min-w-max md:min-w-0 md:flex-wrap">
          {recommendedListings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing as any}
              priority={index < 4}
              showRecommendationBadge
            />
          ))}
        </div>
      </div>
    </section>
  );
}
