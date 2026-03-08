// components/search/SearchResults.tsx
"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ListingCard from "@/components/listing/ListingCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";
// import { Listing } from "@/lib/types/types";

interface SearchResultsProps {
  listings: any;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function SearchResults({
  listings,
  pagination,
}: SearchResultsProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  if (!listings || listings.length === 0) {
    return (
      <>
        <div className="flex flex-col h-100 items-center justify-center py-12">
          <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6 mx-auto">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {listings.length} of {pagination.totalCount} results
        </p>
      </div>

      {/* Results Grid */}
      <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth space-y-8">
        <div className="w-full flex flex-row gap-x-6 gap-y-8">
          {listings.slice(0, 6).map((listing: any) => (
            <ListingCard
              key={listing.id}
              priority
              listing={listing}
              showLocation
            />
          ))}
        </div>
        {listings.length > 6 && (
          <div className="w-full flex flex-row gap-x-6 gap-y-8">
            {listings.slice(6).map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} showLocation />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination className="pt-4">
          <PaginationContent>
            {pagination.page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={createPageUrl(pagination.page - 1)} />
              </PaginationItem>
            )}

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, current, and adjacent pages
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - pagination.page) <= 1
                );
              })
              .map((page, index, array) => {
                // Add ellipsis
                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-2">...</span>}
                    <PaginationItem>
                      <PaginationLink
                        href={createPageUrl(page)}
                        isActive={page === pagination.page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              })}

            {pagination.page < pagination.totalPages && (
              <PaginationItem>
                <PaginationNext href={createPageUrl(pagination.page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}