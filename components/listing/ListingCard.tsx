"use client";
import React from "react";
import Image from "next/image";
import { HiBadgeCheck } from "react-icons/hi";
import { MdCancel } from "react-icons/md";
import { BsDot } from "react-icons/bs";
import { FaStar, FaRegHeart, FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";

export interface ListingImage {
  publicId: string;
  url: string;
}

interface Listing {
  id: string;
  type: string;
  name: string;
  description: string;
  location: string;
  pricePerDay: number;
  image: ListingImage;
  isAvailable: boolean;
  createdAt?: number;
  updatedAt?: number;
  bookings?: any[];
}

interface ListingCardProps {
  listing: Listing;
  priority?: boolean;
  showLocation?: boolean;
}

const ListingCard = ({
  listing,
  priority = false,
  showLocation = false,
}: ListingCardProps) => {
  return (
    <div className="relative flex-1 min-w-52.25 max-w-52.5 items-stretch group overflow-hidden">
      <Link
        href={`/vehicles/${listing.id}`}
        className="flex w-full h-full flex-col justify-between gap-y-4 rounded-xl"
      >
        {listing.isAvailable && (
          <div
            className={`z-10 flex items-center justify-center gap-x-0.5 absolute w-fit h-fit top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-card text-primary shadow-sm`}
          >
            <HiBadgeCheck />
            Available
          </div>
        )}

        <div className="relative w-full h-48 overflow-hidden rounded-3xl bg-border border border-border">
          <Image
            className="object-cover transform group-hover:scale-105 transition-all duration-200 ease-in-out"
            src={listing.image?.url || "/vehicle1.jfif"}
            fill
            sizes="210px"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjE5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjEwIiBoZWlnaHQ9IjE5MiIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            alt={listing.name}
          />
        </div>
        <div className="flex flex-col gap-y-1 px-2">
          <div className="text-md truncate">{listing.name}</div>
          {/* {showLocation && (
            <div className="text-sm text-muted-foreground w-full flex gap-x-1 items-center">
              <FaMapMarkerAlt className="text-xs" />
              <span className="w-full truncate">{listing.location}</span>
            </div>
          )} */}
          <div className="text-sm text-muted-foreground">
            {`NPR ${listing.pricePerDay.toLocaleString()} per day`}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
