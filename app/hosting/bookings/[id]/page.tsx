import { notFound } from "next/navigation";
import prisma from "@/prisma";
import BookingClient from "@/components/hosting/BookingClient";

interface BookingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: BookingDetailPageProps) => {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      listing: {
        select: {
          id: true,
          name: true,
          type: true,
          image: true,
          fuelType: true,
          transmission: true,
          condition: true,
          pricePerDay: true,
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // Cast image to proper type for client component
  const typedBooking = {
    ...booking,
    listing: {
      ...booking.listing,
      image: booking.listing.image as { url?: string } | null,
    },
  };

  return <BookingClient booking={typedBooking} />;
};

export default page;
