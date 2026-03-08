"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { RxCross2 } from "react-icons/rx";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import { useRouter, useSearchParams } from "next/navigation";
// import { toast } from "sonner";

interface AvailabilityCheckProps {
  listingId: string;
  pricePerDay: number;
  minRentalDays?: number;
  maxRentalDays?: number;
  unavailableDates: any;
}

const AvailabilityCheck = ({
  listingId,
  pricePerDay,
  minRentalDays = 1,
  maxRentalDays = 90,
  unavailableDates,
}: AvailabilityCheckProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
//   const [unavailableDates, setUnavailableDates] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<"pickup" | "dropoff" | null>(
    null,
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);

  const refs = useRef<Record<string, HTMLDivElement | null>>({
    pickup: null,
    dropoff: null,
  });

  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateIndicator = (filter: "pickup" | "dropoff" | null) => {
    if (!filter || !searchBarRef.current) {
      setIndicator(null);
      return;
    }
    const target = refs.current[filter];
    if (!target) {
      setIndicator(null);
      return;
    }
    const parentRect = searchBarRef.current.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    setIndicator({
      left: rect.left - parentRect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    updateIndicator(activeFilter);
    const onResize = () => updateIndicator(activeFilter);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeFilter]);

  const getFilterClassName = (filterType: "pickup" | "dropoff") =>
    cn(
      "flex flex-col items-start px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer relative z-10",
    );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setDateRange(undefined);
      return;
    }

    if (activeFilter === "pickup") {
      if (dateRange?.to && date > dateRange.to) {
        return;
      }
      
      // Validate min/max rental period if dropoff is already selected
      if (dateRange?.to) {
        const daysDiff = Math.ceil(
          (dateRange.to.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysDiff < minRentalDays || daysDiff > maxRentalDays) {
          return;
        }
      }
      
      setDateRange({ from: date, to: dateRange?.to });
      setActiveFilter("dropoff");
    } else if (activeFilter === "dropoff") {
      if (dateRange?.from && date < dateRange.from) {
        return;
      }

      // Validate min/max rental period if pickup is already selected
      if (dateRange?.from) {
        const daysDiff = Math.ceil(
          (date.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysDiff < minRentalDays || daysDiff > maxRentalDays) {
          return;
        }
      }

      setDateRange({ from: dateRange?.from, to: date });
      setActiveFilter(dateRange?.from ? null : "pickup");
    }
  };

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return unavailableDates.some((period: any) => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Get the start date of the first unavailable period after a given date
  const getNextUnavailabilityStart = (afterDate: Date): Date | null => {
    const normalized = new Date(afterDate);
    normalized.setHours(0, 0, 0, 0);

    const nextPeriod = unavailableDates
      .map((period: any) => {
        const start = new Date(period.startDate);
        start.setHours(0, 0, 0, 0);
        return start;
      })
      .filter((start: any) => start > normalized)
      .sort((a: any, b: any) => a.getTime() - b.getTime())[0];

    return nextPeriod || null;
  };

  // Get the end date of the last unavailable period before a given date
  const getPreviousUnavailabilityEnd = (beforeDate: Date): Date | null => {
    const normalized = new Date(beforeDate);
    normalized.setHours(0, 0, 0, 0);

    const prevPeriod = unavailableDates
      .map((period: any) => {
        const end = new Date(period.endDate);
        end.setHours(0, 0, 0, 0);
        return end;
      })
      .filter((end: any) => end < normalized)
      .sort((a: any, b: any) => b.getTime() - a.getTime())[0];

    return prevPeriod || null;
  };

  // Determine if a date should be disabled
  const shouldDisableDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Always disable past dates and unavailable dates
    if (checkDate < today || isDateUnavailable(checkDate)) {
      return true;
    }

    // When pickup is selected and selecting dropoff
    if (activeFilter === "dropoff" && dateRange?.from) {
      // Disable dates before pickup
      if (checkDate <= dateRange.from) return true;

      // Calculate days difference for min/max rental period
      const daysDiff = Math.ceil(
        (checkDate.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Disable dates that would violate min rental days
      if (daysDiff < minRentalDays) return true;

      // Disable dates that would violate max rental days
      if (daysDiff > maxRentalDays) return true;

      // Disable dates after the next unavailability period
      const nextUnavailable = getNextUnavailabilityStart(dateRange.from);
      if (nextUnavailable && checkDate >= nextUnavailable) return true;
    }

    // When dropoff is selected and selecting pickup
    if (activeFilter === "pickup" && dateRange?.to) {
      // Disable dates after dropoff
      if (checkDate >= dateRange.to) return true;

      // Calculate days difference for min/max rental period
      const daysDiff = Math.ceil(
        (dateRange.to.getTime() - checkDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Disable dates that would violate min rental days
      if (daysDiff < minRentalDays) return true;

      // Disable dates that would violate max rental days
      if (daysDiff > maxRentalDays) return true;

      // Disable dates before (and including) the previous unavailability period
      const prevUnavailable = getPreviousUnavailabilityEnd(dateRange.to);
      if (prevUnavailable && checkDate <= prevUnavailable) return true;
    }

    return false;
  };

  const handleClearDate = (filter: string) => {
    if (filter === "pickup") {
      setDateRange({ from: undefined, to: dateRange?.to });
    } else if (filter === "dropoff") {
      setDateRange({ from: dateRange?.from, to: undefined });
    }
  };

  // Calculate pricing details
  const calculatePricing = () => {
    if (!dateRange?.from || !dateRange?.to) return null;

    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const total = pricePerDay * diffDays;

    return {
      days: diffDays,
      total,
    };
  };

  const pricing = calculatePricing();

  const handleReserveVehicle = () => {
    // Check if dates are selected
    if (!dateRange?.from || !dateRange?.to) {
      // Could show a toast notification here
    //   toast.error("Please select dates first!");
      return;
    }

    // Set loading state
    setIsReserving(true);

    // Create search params with selected dates
    const params = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });

    router.push(`/book/vehicles/${listingId}?${params.toString()}`);
    setTimeout(() => setIsReserving(false), 2000);    
  }

  return (
    <div className="flex flex-col gap-y-4">
      <label className="text-sm font-medium">Select dates</label>
      {minRentalDays > 1 && (
        <p className="text-xs text-muted-foreground -mt-2">
          Minimum rental period: {minRentalDays} {minRentalDays === 1 ? "day" : "days"}
        </p>
      )}
      <div className="relative" ref={wrapperRef}>
        <div
          ref={searchBarRef}
          className={`relative z-10 flex items-center w-full rounded-xl border border-border transition-all duration-200 ease-in-out ${
            activeFilter ? "bg-border" : "bg-card shadow-sm"
          }`}
        >
          <AnimatePresence>
            {indicator && (
              <motion.div
                key="indicator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  left: indicator.left,
                  width: indicator.width,
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="absolute top-0 bottom-0 bg-card rounded-xl"
                style={{ position: "absolute" }}
              />
            )}
          </AnimatePresence>

          <div
            ref={(el) => {
              refs.current["pickup"] = el;
            }}
            onClick={() => setActiveFilter("pickup")}
            className={cn(getFilterClassName("pickup"), "w-1/2")}
          >
            <div className="text-sm font-semibold">Pickup</div>
            <div className="flex flex-row items-center truncate w-full text-md">
              {dateRange?.from ? (
                format(dateRange.from, "MMM dd")
              ) : (
                <span className="text-muted-foreground">Add date</span>
              )}
            </div>
            {activeFilter === "pickup" && dateRange?.from && (
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center bg-transparent rounded-full w-6 h-6 hover:bg-border duration-200 transition-all ease-in-out cursor-pointer"
                onClick={() => handleClearDate("pickup")}
              >
                <RxCross2 />
              </button>
            )}
          </div>
          {!activeFilter && (
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-10 w-px bg-border"></div>
          )}
          <div
            ref={(el) => {
              refs.current["dropoff"] = el;
            }}
            onClick={() => setActiveFilter("dropoff")}
            className={cn(getFilterClassName("dropoff"), "w-1/2")}
          >
            <div className="text-sm font-semibold">Dropoff</div>
            <div className="flex items-center truncate w-full text-md">
              {dateRange?.to ? (
                format(dateRange.to, "MMM dd")
              ) : (
                <span className="text-muted-foreground">Add date</span>
              )}
            </div>
            {activeFilter === "dropoff" && dateRange?.to && (
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center bg-transparent rounded-full w-6 h-6 hover:bg-border duration-200 transition-all ease-in-out cursor-pointer"
                onClick={() => handleClearDate("dropoff")}
              >
                <RxCross2 />
              </button>
            )}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {activeFilter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 50,
              }}
              className="absolute top-16 right-0 z-10 bg-card p-4 border border-border rounded-xl shadow-lg flex justify-center"
            >
              <Calendar
                mode="single"
                selected={dateRange?.to || dateRange?.from}
                onSelect={handleDateSelect}
                showOutsideDays={false}
                numberOfMonths={2}
                disabled={shouldDisableDate}
                modifiers={{
                  range_start: dateRange?.from,
                  range_end: dateRange?.to,
                  range_middle:
                    dateRange?.from && dateRange?.to
                      ? (date) => {
                          return date > dateRange.from! && date < dateRange.to!;
                        }
                      : undefined,
                }}
                className="rounded-lg w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pricing Breakdown */}
      {pricing && (
        <div className="flex flex-col gap-y-3 py-6 border-y border-border mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-x-px">
              <TbCurrencyRupeeNepalese className="inline size-4" /> {pricePerDay.toLocaleString()} x {pricing.days}{" "}
              {pricing.days === 1 ? "day" : "days"}
            </span>
            <span className="flex items-center gap-0.5">
              <TbCurrencyRupeeNepalese className="size-4" />
              {pricing.total.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span className="flex items-center gap-0.5">
              <TbCurrencyRupeeNepalese className="size-5" />
              {pricing.total.toLocaleString()}
            </span>
          </div>
        </div>
      )}
      <button 
        className="w-full mx-auto mt-4 text-lg py-2 px-4 rounded-full bg-primary text-primary-foreground font-medium text-center cursor-pointer shadow-sm hover:shadow-md hover:bg-primary/90 duration-200 transition-all ease-in-out disabled:bg-primary/50 disabled:cursor-not-allowed"
        onClick={handleReserveVehicle}
        disabled={!dateRange?.from || !dateRange?.to || isReserving}
      >
        {isReserving ? "Loading..." : "Reserve"}
      </button>

      <p className="text-muted-foreground text-sm text-center">
        You won't be charged yet
      </p>
    </div>
  );
};

export default AvailabilityCheck;