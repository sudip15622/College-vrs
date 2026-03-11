"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingFormSchema, BookingFormData } from "@/lib/schemas/booking";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { FaStar } from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { IoMdArrowRoundBack } from "react-icons/io";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { InitiateBooking } from "@/lib/actions/booking";
import { initiateKhaltiPayment } from "@/lib/actions/payment";

interface BookingPageClientProps {
  vehicle: any;
  // user: User | null;
  pickupDate?: string;
  dropoffDate?: string;
}

type PaymentType = "Khalti" | "Esewa";

const BookingPageClient = ({
  vehicle,
  // user,
  pickupDate,
  dropoffDate,
}: BookingPageClientProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: pickupDate ? new Date(pickupDate) : undefined,
    to: dropoffDate ? new Date(dropoffDate) : undefined,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      renterContactNumber: "",
      renterNotes: "",
      paymentMethod: "Khalti",
      termsAccepted: false,
    },
    mode: "onChange",
    reValidateMode: "onSubmit",
  });

  const paymentMethod = watch("paymentMethod");

  const minRentalDays = vehicle.minRentalDays || 1;
  const maxRentalDays = vehicle.maxRentalDays || 90;
  const unavailableDates = vehicle.bookings || [];

  // Lock body scroll when calendar is open
  useEffect(() => {
    if (showCalendar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCalendar]);

  const calculatePricing = () => {
    if (!vehicle) return null;
    if (!dateRange?.from || !dateRange?.to) return null;

    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const total = vehicle.pricePerDay * diffDays;

    return {
      days: diffDays,
      total,
    };
  };

  const pricing = calculatePricing();

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
      .filter((start: Date) => start > normalized)
      .sort((a: Date, b: Date) => a.getTime() - b.getTime())[0];

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
      .filter((end: Date) => end < normalized)
      .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];

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

    // When selecting with an existing range
    if (dateRange?.from && !dateRange?.to) {
      // Selecting the end date
      if (checkDate <= dateRange.from) return true;

      const daysDiff = Math.ceil(
        (checkDate.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysDiff < minRentalDays || daysDiff > maxRentalDays) return true;

      const nextUnavailable = getNextUnavailabilityStart(dateRange.from);
      if (nextUnavailable && checkDate >= nextUnavailable) return true;
    }

    if (dateRange?.to && !dateRange?.from) {
      // Selecting the start date
      if (checkDate >= dateRange.to) return true;

      const daysDiff = Math.ceil(
        (dateRange.to.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff < minRentalDays || daysDiff > maxRentalDays) return true;

      const prevUnavailable = getPreviousUnavailabilityEnd(dateRange.to);
      if (prevUnavailable && checkDate <= prevUnavailable) return true;
    }

    return false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setDateRange(undefined);
      return;
    }

    // No range selected yet - set as start date
    if (!dateRange?.from && !dateRange?.to) {
      setDateRange({ from: date, to: undefined });
      return;
    }

    // Start date selected, now selecting end date
    if (dateRange?.from && !dateRange?.to) {
      if (date < dateRange.from) {
        // Selected date is before start - swap them
        setDateRange({ from: date, to: dateRange.from });
      } else {
        // Selected date is after start - set as end
        setDateRange({ from: dateRange.from, to: date });
      }
      return;
    }

    // Both dates already selected - reset and start new selection
    if (dateRange?.from && dateRange?.to) {
      setDateRange({ from: date, to: undefined });
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    // Validate dates are selected
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select rental dates");
      return;
    }

    if (!pricing) {
      toast.error("Unable to calculate pricing");
      return;
    }

    if(paymentMethod && paymentMethod !== "Khalti") {
      toast.error("Esewa payment is coming soon. Please do start with Khalti for now!")
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create booking with Pending status
      const bookingResult = await InitiateBooking(vehicle.id, {
        startDate: dateRange.from,
        endDate: dateRange.to,
        totalDays: pricing.days,
        pricePerDay: vehicle.pricePerDay,
        totalPrice: pricing.total,
        renterContactNumber: data.renterContactNumber,
        renterNotes: data.renterNotes?.trim(),
        paymentMethod: data.paymentMethod,
      });

      if (!bookingResult.success) {
        toast.error(bookingResult.error || "Failed to create booking");
        setIsSubmitting(false);
        return;
      }

      if (bookingResult.data?.payment?.payment_url) {
        // Redirect to payment gateway
        window.location.href = bookingResult.data.payment.payment_url;
      } else {
        toast.error("Failed to initiate payment. Please try again.");
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error("Booking submission error:", error);
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const nepaliWallets = [
    {
      name: "Khalti",
      link: "/khalti.png",
    },
    {
      name: "Esewa",
      link: "/esewa.png",
    },
  ];

  return (
    <>
      <div className="relative w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold">Complete your booking</h1>
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="text-xl rounded-full bg-card p-2 border border-border shadow-sm hover:bg-background hover:shadow-md hover:border-primary duration-200 transition-all ease-in-out absolute -left-14 top-1/2 -translate-y-1/2"
        >
          <IoMdArrowRoundBack />
        </Link>
      </div>
      <div className="w-full max-w-5xl mx-auto flex gap-x-10 relative">
        {/* left side */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
          {/* Contact Information */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-lg">
              Contact Number <span className="text-destructive">*</span>
            </h3>
            <div className="space-y-2">
              <Controller
                name="renterContactNumber"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <span className="absolute text-base left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
                      +977
                    </span>
                    <Input
                      {...field}
                      id="renterContactNumber"
                      type="tel"
                      placeholder="98XXXXXXXX"
                      maxLength={10}
                      className="pl-14"
                    />
                  </div>
                )}
              />
              {errors.renterContactNumber && (
                <p className="text-sm text-destructive">
                  {errors.renterContactNumber.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The owner will use this number to contact you about pickup
                details
              </p>
            </div>
          </div>

          {/* Message to Owner */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-lg">
              Message to Owner{" "}
              <span className="text-muted-foreground font-normal text-sm">
                (Optional)
              </span>
            </h3>
            <Controller
              name="renterNotes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Any special requests or questions? (e.g., First time rider, need helmet size L)"
                  rows={4}
                />
              )}
            />
            {errors.renterNotes && (
              <p className="text-sm text-destructive">
                {errors.renterNotes.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-lg">
              Payment Method <span className="text-destructive">*</span>
            </h3>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-4">
                  {nepaliWallets.map((wallet, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() =>
                          setValue("paymentMethod", wallet.name as PaymentType)
                        }
                        className={`relative py-2 px-4 flex items-center gap-x-4 rounded-xl border border-border cursor-pointer transition-all duration-200 hover:border-primary ${
                          paymentMethod === wallet.name
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="w-10 h-10 relative overflow-hidden rounded-full">
                          <Image
                            className="object-cover w-full h-full"
                            src={wallet.link}
                            alt={wallet.name.toLowerCase()}
                            fill
                            sizes="40px"
                            unoptimized
                          />
                        </div>
                        <div className="font-medium text-lg">{wallet.name}</div>
                        {paymentMethod === wallet.name && (
                          <FaCheckCircle className="absolute top-1/2 right-4 -translate-y-1/2 size-5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            />
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-lg">
              Rental Terms <span className="text-destructive">*</span>
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Vehicle pickup location: {vehicle.address}</p>
              <p>• Vehicle condition will be documented at pickup and return</p>
              <p>• Fuel level should match at pickup and return</p>
              <p>• Any damages must be reported immediately</p>
              <p>• Review the cancellation policy carefully</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-3 pt-4">
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="termsAccepted"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      className="mt-1"
                    />
                  )}
                />
                <Label
                  htmlFor="termsAccepted"
                  className="cursor-pointer font-normal text-sm"
                >
                  {`I agree to the rental terms and conditions, and authorize the payment of Rs. ${pricing?.total.toLocaleString() || 0} through the selected payment method.`}
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-destructive">
                  {errors.termsAccepted.message}
                </p>
              )}
            </div>
          </div>

          {/* Pay Now Button */}
          <Button
            type="submit"
            disabled={
              !dateRange?.from || !dateRange?.to || !isValid || isSubmitting
            }
            className="w-full h-12 text-lg font-semibold rounded-full"
          >
            {isSubmitting ? "Processing..." : "Pay Now"}
          </Button>
        </form>

        {/* right side  */}
        <div className="flex flex-col gap-y-4 p-6 rounded-3xl w-full max-w-sm border border-border sticky top-24 self-start">
          {/* vehicle details  */}
          <div className="flex gap-x-4">
            <div className="w-35 h-22 relative overflow-hidden rounded-xl bg-border border border-border">
              <Image
                className="object-cover w-full h-full"
                src={vehicle.image.url || "/type_bike.png"}
                alt="cover-photo"
                fill
                sizes="140px"
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center gap-y-1">
              <h3 className="font-semibold text-xl">{`${vehicle.brand} ${vehicle.model} (${vehicle.year})`}</h3>
              <div className="flex items-center gap-x-1">
                <FaStar className="text-primary size-3" />
                <span className="font-medium text-foreground">
                  {vehicle.averageRating > 0 ? vehicle.averageRating : "New"}
                </span>
                <span>{`(${vehicle.reviewCount})`}</span>
              </div>
            </div>
          </div>

          {/* policies and terms  */}
          <div className="space-y-1">
            <h4 className="font-medium">Rental Terms</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
              {vehicle.allowedKmPerDay && (
                <>
                  {vehicle.allowedKmPerDay} km/day limit
                  {(vehicle.extraKmCharge ||
                    vehicle.minRentalDays ||
                    vehicle.maxRentalDays) &&
                    " • "}
                </>
              )}
              {vehicle.extraKmCharge && (
                <>
                  <span className="flex items-center gap-0.5">
                    <TbCurrencyRupeeNepalese className="size-3.5" />
                    {vehicle.extraKmCharge}/km extra charge
                  </span>
                  {(vehicle.minRentalDays || vehicle.maxRentalDays) && " • "}
                </>
              )}
              {vehicle.minRentalDays && (
                <>
                  Min {vehicle.minRentalDays}{" "}
                  {vehicle.minRentalDays === 1 ? "day" : "days"}
                  {vehicle.maxRentalDays && " • "}
                </>
              )}
              {vehicle.maxRentalDays && (
                <>
                  Max {vehicle.maxRentalDays}{" "}
                  {vehicle.maxRentalDays === 1 ? "day" : "days"}
                </>
              )}
            </p>
          </div>

          <div className="border-t border-border" />
          {/* dates */}
          <div>
            <div className="flex items-center justify-between gap-x-5">
              <div className="space-y-1">
                <h4 className="font-medium">Dates</h4>
                {dateRange?.from && dateRange?.to && (
                  <span>
                    {format(dateRange.from, "MMM dd")} -{" "}
                    {format(dateRange.to, "MMM dd, yyyy")}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                Change
              </Button>
            </div>
          </div>

          {/* Calendar Popup - Full Page Overlay */}
          <AnimatePresence mode="wait">
            {showCalendar && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="calendar-backdrop fixed inset-0 bg-black/20 z-100"
                  onClick={() => setShowCalendar(false)}
                />

                {/* Calendar Modal */}
                <motion.div
                  ref={calendarRef}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101 bg-card p-6 border border-border rounded-2xl shadow-2xl flex justify-center w-full max-w-2xl"
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
                              return (
                                date > dateRange.from! && date < dateRange.to!
                              );
                            }
                          : undefined,
                    }}
                    className="rounded-lg w-full"
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* pricing breakdown */}
          {pricing && (
            <>
              <div className="border-t border-border" />
              <div className="space-y-1">
                <h4 className="font-medium">Price details</h4>
                <div className="flex items-center justify-between gap-x-5">
                  <span className="flex items-center gap-x-px">
                    <TbCurrencyRupeeNepalese className="inline size-4" />{" "}
                    {vehicle.pricePerDay.toLocaleString()} x {pricing.days}{" "}
                    {pricing.days === 1 ? "day" : "days"}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <TbCurrencyRupeeNepalese className="size-4" />
                    {pricing.total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between font-semibold">
                <h4 className="font-medium">Total</h4>
                <span className="flex items-center gap-0.5">
                  <TbCurrencyRupeeNepalese className="size-5" />
                  {pricing.total.toLocaleString()}
                </span>
              </div>
            </>
          )}
          <div className="border-t border-border" />
          <p className="text-muted-foreground text-sm w-full max-w-3/4 text-center mx-auto">
            Payment will be processed securely through your selected payment
            method.
          </p>
        </div>
      </div>
    </>
  );
};

export default BookingPageClient;
