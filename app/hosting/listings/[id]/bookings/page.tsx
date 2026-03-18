import React from "react";
import { getListingById, getListingBookings } from "@/lib/actions/listing";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import BookingActionsMenu from "@/app/hosting/bookings/BookingActionsMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

const VehicleBookingsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [listing, bookings] = await Promise.all([
    getListingById(id),
    getListingBookings(id),
  ]);

  if (!listing) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{listing.name}</h1>
        <p className="text-muted-foreground">Manage bookings for this vehicle</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No bookings yet for this vehicle</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[34%]">Booked By</TableHead>
                <TableHead className="w-[26%]">Dates</TableHead>
                <TableHead className="w-[14%]">Total Price</TableHead>
                <TableHead className="w-[14%] text-center">Status</TableHead>
                <TableHead className="w-[12%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
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
                        <div className="min-w-0">
                          <p className="max-w-56 truncate font-medium">{booking.user.name}</p>
                          <p className="max-w-56 truncate text-xs text-muted-foreground">
                            {booking.user.email}
                          </p>
                        </div>
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
    </div>
  );
};

export default VehicleBookingsPage;
