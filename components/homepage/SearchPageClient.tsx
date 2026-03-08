// components/pages/SearchPageClient.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchResults from "./SearchResults";
import { Skeleton } from "@/components/ui/skeleton";
import { searchListings } from "@/lib/actions/listing";

function SearchSkeleton() {
  return (
    <div className="w-full space-y-5">
      <Skeleton className="h-6 w-64 bg-border" />
      <div className="w-full flex flex-row gap-x-6 overflow-x-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-54 flex flex-col gap-y-4 items-stretch"
          >
            <Skeleton className="h-48 w-full rounded-3xl bg-border" />
            <div className="space-y-1 px-2">
              <Skeleton className="h-4 w-3/4 bg-border" />
              <Skeleton className="h-3 w-full bg-border" />
              <Skeleton className="h-4 w-1/2 bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Extract search parameters
        const page = parseInt(searchParams.get("page") || "1");
        // const limit = parseInt(searchParams.get("limit") || "12");
        const name = searchParams.get("name") || undefined;
        const type = searchParams.get("type") as "Bike" | "Scooter" | undefined;
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");
        const minPriceStr = searchParams.get("minPrice");
        const maxPriceStr = searchParams.get("maxPrice");

        // Parse dates if provided
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;

        // Parse prices if provided
        const minPrice = minPriceStr ? parseInt(minPriceStr) : undefined;
        const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : undefined;

        // Call the search action
        const result = await searchListings({
          page,
        //   limit,
          name,
          type,
          startDate,
          endDate,
          minPrice,
          maxPrice,
        });

        // Transform the result to match expected format
        const transformedResult = {
          data: result.listings,
          meta: {
            page: result.pagination.page,
            limit: result.pagination.limit,
            totalCount: result.pagination.total,
            totalPages: result.pagination.totalPages,
            hasNextPage: result.pagination.page < result.pagination.totalPages,
            hasPrevPage: result.pagination.page > 1,
          },
        };

        setResults(transformedResult);
      } catch (error) {
        console.error("Error fetching:", error);
        setError("Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (isLoading) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!results?.data || results.data.length === 0) {
    return (
      <div className="h-100 flex flex-col items-center justify-center py-12">
        <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
        <p className="text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <SearchResults listings={results.data} pagination={results.meta} />
  );
}