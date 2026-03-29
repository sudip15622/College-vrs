"use client";

import dynamic from "next/dynamic";
import {
  BookingStatusDistributionDataPoint,
  BookingTrendDataPoint,
  RevenueByVehicleDataPoint,
  RevenueTrendDataPoint,
  TopVehiclesByBookingsDataPoint,
} from "@/lib/actions/booking";

type RangeOption = "30d" | "7d" | "3m";

interface HostingDashboardChartsClientProps {
  revenueTrendData: RevenueTrendDataPoint[];
  revenueByVehicleDataByRange: Record<RangeOption, RevenueByVehicleDataPoint[]>;
  bookingTrendData: BookingTrendDataPoint[];
  bookingStatusDistributionDataByRange: Record<
    RangeOption,
    BookingStatusDistributionDataPoint[]
  >;
  topVehiclesByBookingsDataByRange: Record<
    RangeOption,
    TopVehiclesByBookingsDataPoint[]
  >;
}

const RevenueTrendClient = dynamic(
  () => import("@/components/dashboard/RevenueTrend"),
  { ssr: false },
);

const RevenueByVehicleClient = dynamic(
  () => import("@/components/dashboard/RevenueByVehicle"),
  { ssr: false },
);

const BookingsTrendClient = dynamic(
  () => import("@/components/dashboard/BookingsTrend"),
  { ssr: false },
);

const BookingStatusDistributionClient = dynamic(
  () => import("@/components/dashboard/BookingStatusDistribution"),
  { ssr: false },
);

const TopVehiclesByBookingsClient = dynamic(
  () => import("@/components/dashboard/TopVehiclesByBookings"),
  { ssr: false },
);

const HostingDashboardChartsClient = ({
  revenueTrendData,
  revenueByVehicleDataByRange,
  bookingTrendData,
  bookingStatusDistributionDataByRange,
  topVehiclesByBookingsDataByRange,
}: HostingDashboardChartsClientProps) => {
  return (
    <>
      <div className="space-y-4 mt-4">
        <h2 className="text-lg font-medium">Revenue & Financial Analytics</h2>
        <div className="space-y-4">
          <RevenueTrendClient initialData={revenueTrendData} />
          <RevenueByVehicleClient dataByRange={revenueByVehicleDataByRange} />
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <h2 className="text-lg font-medium">Booking Analytics</h2>
        <BookingsTrendClient initialData={bookingTrendData} />
        <div className="grid gap-4 md:grid-cols-2">
          <BookingStatusDistributionClient
            dataByRange={bookingStatusDistributionDataByRange}
          />
          <TopVehiclesByBookingsClient
            dataByRange={topVehiclesByBookingsDataByRange}
          />
        </div>
      </div>
    </>
  );
};

export default HostingDashboardChartsClient;
