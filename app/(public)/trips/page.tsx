import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/lib/actions/booking";
import TripsPageClient from "@/components/trips/TripsPageClient";
import { Skeleton } from "@/components/ui/skeleton";

async function TripsContent() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?returnTo=/trips");
  }

  const result = await getUserBookings();

  if (!result.success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load your trips</p>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return <TripsPageClient bookings={result.bookings || []} />;
}

function TripsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

const page = async () => {
  return (
    <Suspense fallback={<TripsPageSkeleton />}>
      <TripsContent />
    </Suspense>
  );
};

export default page;
