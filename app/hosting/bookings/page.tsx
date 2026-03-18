import React from "react";
import Image from "next/image";
import { searchBookings } from "@/lib/actions/booking";
import { Card, CardContent } from "@/components/ui/card";
import BookingActionsMenu from "./BookingActionsMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const BookingsPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 10;

  const { bookings, pagination } = await searchBookings({
    page: currentPage,
    limit,
  });

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Bookings</h1>
        <p className="text-muted-foreground">Manage all vehicle bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No bookings found</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[24%]">Booked By</TableHead>
                <TableHead className="w-[24%]">Vehicle</TableHead>
                <TableHead className="w-[20%]">Dates</TableHead>
                <TableHead className="w-[10%]">Total Price</TableHead>
                <TableHead className="w-[12%] text-center">Status</TableHead>
                <TableHead className="w-[10%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const listingImage = booking.listing.image as {
                  url: string;
                  publicId: string;
                };

                const statusClassName =
                  booking.status === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "Active"
                      ? "bg-blue-100 text-blue-800"
                      : booking.status === "Completed"
                        ? "bg-gray-100 text-gray-800"
                        : booking.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800";

                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border">
                          <Image
                            src={booking.user.image || "/default_user.png"}
                            alt={booking.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="max-w-52 truncate font-medium">
                          {booking.user.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border">
                          {listingImage?.url ? (
                            <Image
                              src={listingImage.url}
                              alt={booking.listing.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </div>
                        <span className="max-w-52 truncate font-medium">
                          {booking.listing.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm">
                        {new Date(booking.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                        {" - "}
                        {new Date(booking.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>

                    <TableCell className="font-medium">₹{booking.totalPrice}</TableCell>

                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClassName}`}
                      >
                        {booking.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <BookingActionsMenu bookingId={booking.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={
                    currentPage > 1
                      ? `/hosting/bookings?page=${currentPage - 1}`
                      : "#"
                  }
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from(
                { length: pagination.totalPages },
                (_, index) => index + 1,
              ).map((page) => {
                const showPage =
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/hosting/bookings?page=${page}`}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href={
                    currentPage < pagination.totalPages
                      ? `/hosting/bookings?page=${currentPage + 1}`
                      : "#"
                  }
                  className={
                    currentPage >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {bookings.length > 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Showing {(currentPage - 1) * limit + 1} to{" "}
          {Math.min(currentPage * limit, pagination.total)} of {pagination.total} bookings
        </p>
      )}
    </div>
  );
};

export default BookingsPage;

