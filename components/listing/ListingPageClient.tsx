"use client";
// import { Review, VehicleDetails } from "@/lib/types/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaImage } from "react-icons/fa6";
import { FaRegFlag } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import { MdCancel, MdPhoneAndroid } from "react-icons/md";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import {
  FaStar,
  FaRegHeart,
  FaMapMarkerAlt,
  FaRoad,
  FaFlag,
  FaRegUser,
  FaUsb,
  FaBluetooth,
  FaKey,
} from "react-icons/fa";
import { GiCarWheel, GiFullMotorcycleHelmet } from "react-icons/gi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { TbManualGearboxFilled } from "react-icons/tb";
import { BsDot, BsFillFuelPumpFill, BsStars, BsBoxSeam } from "react-icons/bs";
import { SiGoogleearthengine } from "react-icons/si";
import { MdGpsFixed } from "react-icons/md";
import { PiSpeedometerFill } from "react-icons/pi";
import { HiLightBulb } from "react-icons/hi";
import { GiDiscGolfBag } from "react-icons/gi";
import { AiOutlineSafety } from "react-icons/ai";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import AvailabilityCheck with no SSR to avoid AuthContext issues
const AvailabilityCheck = dynamic(() => import("./AvailabilityCheck"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-y-4">
      <Skeleton className="h-5 w-24" />
      <div className="relative">
        <div className="relative z-10 flex items-center w-full rounded-xl border border-border bg-card shadow-sm">
          <div className="w-1/2 py-3 px-4 flex flex-col gap-1">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-10 w-px bg-border"></div>
          <div className="w-1/2 py-3 px-4 flex flex-col gap-1">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
      <div className="border-t border-border" />
      <Skeleton className="h-10 w-full rounded-full mt-4" />
      <Skeleton className="h-4 w-40 mx-auto" />
    </div>
  ),
});

interface ListingPageProps {
  details: any;
  vehicleId: string;
}

const ListingPageClient = ({ details, vehicleId }: ListingPageProps) => {
  const defaultReviews = [
    {
      id: "1",
      rating: 5,
      reviewedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      comment:
        "Excellent bike! Very smooth ride and the owner was super helpful. Highly recommend for anyone looking for a reliable rental in Kathmandu.",
      user: {
        id: "user1",
        name: "Sujeet Acharya",
      },
    },
    {
      id: "2",
      rating: 4.5,
      reviewedAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
      comment:
        "Great experience overall. The bike was in perfect condition and well-maintained. Only minor issue was the pickup time was slightly delayed.",
      user: {
        id: "user2",
        name: "Adisan Khatri",
      },
    },
    {
      id: "3",
      rating: 3,
      reviewedAt: Date.now() - 21 * 24 * 60 * 60 * 1000, // 21 days ago
      comment:
        "Perfect for my weekend trip to Pokhara! Good fuel efficiency and comfortable ride. Would definitely rent again.",
      user: {
        id: "user3",
        name: "Aadesh Pandey",
      },
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-border w-full h-100 relative overflow-hidden rounded-2xl border border-border">
            <Image
              className="object-cover"
              src={details.image.url}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
              priority
              alt={`${details.name} - Main Image`}
            />
          </div>
          {/* brand detials and address  */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-x-10">
              <h1 className="text-3xl font-medium">{details.name}</h1>
              <div className="flex items-center gap-x-2 justify-center">
                <button className="py-1 px-2 w-fit flex items-center justify-center gap-x-1.5 rounded-lg cursor-pointer underline hover:bg-border transition-all duration-200 ease-in-out">
                  <FiShare />
                  Share
                </button>
                <button className="py-1 px-2 w-fit flex items-center justify-center gap-x-1.5 rounded-lg cursor-pointer underline hover:bg-border transition-all duration-200 ease-in-out">
                  <FaRegHeart />
                  Save
                </button>
              </div>
            </div>
            <div className="flex items-center gap-x-2 text-lg text-muted-foreground">
              <FaMapMarkerAlt className="text-md" />
              Bharatpur-10, Chitwan
            </div>

            {/* {details.averateRating === 5 && details.reviewCount >= 5 ? (
              <div className="my-7 flex items-center justify-between p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-x-2">
                  <BsStars className="text-secondary size-8" />
                  <h3 className="text-lg font-semibold flex flex-col items-center justify-center gap-0 leading-tight">
                    <span>Renter</span>
                    <span>favourite</span>
                  </h3>
                  <BsStars className="text-secondary size-8" />
                </div>
                <p className="font-medium max-w-70">
                  One of the most loved vehicles on OtmRides, according to
                  renters
                </p>
                <div className="relative flex items-center justify-center gap-x-10">
                  <div className="flex flex-col items-center justify-center leading-tight gap-1">
                    <div className="font-semibold text-2xl">5.0</div>
                    <div className="flex items-center gap-px">
                      {[1, 2, 3, 4, 5].map((i) => {
                        return (
                          <FaStar key={i} className="size-2 text-secondary" />
                        );
                      })}
                    </div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-border h-full w-px" />
                  <div className="flex flex-col items-center justify-center leading-tight">
                    <span className="font-semibold text-2xl">
                      {details.reviewCount}
                    </span>
                    <span className="text-[12px] font-medium">Reviews</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-x-1">
                <FaStar className="text-secondary size-3" />
                <span className="font-semibold text-foreground">
                  {details.averageRating > 0 ? details.averageRating : "New"}
                </span>
                <BsDot />
                <span className="underline">
                  {details.reviewCount || 0} reviews
                </span>
              </div>
            )} */}
          </div>
          <div className="border-t border-border" />
          {/* specifications */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <SpecCard
                icon="GiFullMotorcycleHelmet"
                label="Type"
                value={details.type}
              />
              <SpecCard
                icon="TbManualGearboxFilled"
                label="Transmission"
                value={details.transmission}
              />
              <SpecCard
                icon="BsFillFuelPumpFill"
                label="Fuel Type"
                value={details.fuelType}
              />
              {details.engineCapacity && (
                <SpecCard
                  icon="SiGoogleearthengine"
                  label="Engine"
                  value={`${details.engineCapacity} cc`}
                />
              )}
              {details.mileage && (
                <SpecCard
                  icon="FaRoad"
                  label="Mileage"
                  value={`${details.mileage} km/l`}
                />
              )}
              <SpecCard
                icon="BsStars"
                label="Condition"
                value={details.condition}
              />
            </div>
          </div>
          <div className="border-t border-border" />
          {/* description */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">About this vehicle</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {details.description}
            </p>
          </div>
          {/* features */}
          {details.features && details.features.length > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="space-y-4">
                <h2 className="text-xl font-medium">Features & Benefits</h2>
                <div className="grid grid-cols-2 gap-4">
                  {details.features.map((feature: string, index: number) => (
                    <FeatureCard key={index} feature={feature} />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-border" />
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Ratings and Reviews</h2>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-x-2">
                <span className="font-bold text-foreground text-xl">
                  {details.rating ? details.rating : "New"}
                </span>
                <FaStar className="text-primary text-xl" />
              </div>
              <span className="text-muted-foreground">
                ({details.reviews?.length || 10} reviews)
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                REVIEWS
              </h3>
              <div className="space-y-6 w-full">
                {defaultReviews.map((review, index) => {
                  return (
                    <React.Fragment key={review.id}>
                      <div className="flex items-start gap-4 w-full">
                        <div className="w-10 h-10 min-w-10 max-w-10 relative overflow-hidden rounded-full bg-border">
                          <Image
                            className="object-cover w-full h-full"
                            src={"/default_user.png"}
                            alt="reviewer-avatar"
                            fill
                            sizes="40px"
                            unoptimized
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <StarRating rating={review.rating} />
                          <div className="flex items-end">
                            <span className="text-sm font-medium">
                              {review.user.name}
                            </span>
                            <span className="flex items-center justify-center text-lg">
                              <BsDot />
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {format(
                                new Date(review.reviewedAt),
                                "MMM dd yyyy",
                              )}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < defaultReviews.length - 1 && (
                        <div className="border-t border-border" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 relative">
          <div className="sticky top-28 space-y-6">
            {/* Price Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TbCurrencyRupeeNepalese className="size-8" />
                  <span className="text-3xl font-semibold">
                    {details.pricePerDay.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground flex items-baseline">
                    / day
                  </span>
                </div>
              </div>
              <div className="border-t border-border" />
              <AvailabilityCheck
                listingId={details.id}
                pricePerDay={details.pricePerDay}
                unavailableDates={details.bookings}
              />
            </div>
          </div>
        </div>
      </div>
      {/* pickup location */}
      {/* <div className="border-t border-border" /> */}
      {/* <div className="space-y-4">
        <h2 className="text-xl font-medium">
          Where you&apos;ll pickup this vehicle
        </h2>
        <p className="text-muted-foreground">{details.address}</p>
        <LocationMap
          location={{
            latitude: details.latitude,
            longitude: details.longitude,
            address: details.address,
            displayAddress: details.displayAddress,
            placeId: details.placeId,
            city: details.city,
            state: details.state,
            country: details.country,
            postalCode: details.postalCode,
            streetAddress: details.streetAddress,
          }}
        />
      </div> */}
    </div>
  );
};

function SpecCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  // Icon mapping
  const iconMap: { [key: string]: React.ReactNode } = {
    GiFullMotorcycleHelmet: <GiFullMotorcycleHelmet />,
    TbManualGearboxFilled: <TbManualGearboxFilled />,
    BsFillFuelPumpFill: <BsFillFuelPumpFill />,
    SiGoogleearthengine: <SiGoogleearthengine />,
    FaRoad: <FaRoad />,
    BsStars: <BsStars />,
  };

  return (
    <div className="flex gap-4 items-center">
      <span className="text-2xl w-fit h-fit bg-border p-2 flex items-center justify-center rounded-lg text-primary">
        {iconMap[icon]}
      </span>
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: string }) {
  return (
    <div className="flex gap-4 items-center">
      <span className="flex items-center text-2xl">
        <BsStars />
      </span>
      <p className="">{feature}</p>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-0.5">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className="text-primary size-3" />
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <FaStar className="text-border size-3" />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${(rating % 1) * 100}%` }}
          >
            <FaStar className="text-primary size-3" />
          </div>
        </div>
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <FaStar key={`empty-${i}`} className="text-border size-3" />
      ))}
    </div>
  );
}

export default ListingPageClient;
