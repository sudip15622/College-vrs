import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getBookingById } from "@/lib/actions/booking";
import TripDetailsClient from "@/components/trips/TripDetailsClient";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { IoMdArrowRoundBack } from "react-icons/io";

interface TripDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function TripDetailsContent({ params }: TripDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?returnTo=/trips");
  }

  const { id } = await params;

  const result = await getBookingById(id);

  if (!result.success) {
    if (result.error?.includes("not found")) {
      notFound();
    }

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load trip details</p>
          <p className="text-muted-foreground mb-6">{result.error}</p>
          <Link
            href="/trips"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          >
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  return <TripDetailsClient booking={result.booking!} />;
}

function TripDetailsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}

const page = async ({ params }: TripDetailsPageProps) => {
  return (
    <Suspense fallback={<TripDetailsSkeleton />}>
      <TripDetailsContent params={params} />
    </Suspense>
  );
};

export default page;
