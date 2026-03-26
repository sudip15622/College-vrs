import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import BookingStatusDistribution from "@/components/dashboard/BookingStatusDistribution";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Calendar, Users, TrendingUp } from "lucide-react";
import BookingsTrend from "@/components/dashboard/BookingsTrend";
import RevenueTrend from "@/components/dashboard/RevenueTrend";
import RevenueByVehicle from "@/components/dashboard/RevenueByVehicle";
import TopVehiclesByBookings from "@/components/dashboard/TopVehiclesByBookings";
import {
  getDashboardStatsData,
  getBookingStatusDistributionData,
  getBookingTrendData,
  getRevenueByVehicleData,
  getRevenueTrendData,
  getTopVehiclesByBookingsData,
} from "@/lib/actions/booking";

const HostingDashboard = async () => {
  const dashboardStats = await getDashboardStatsData();
  const revenueTrendData = await getRevenueTrendData(90);
  const revenueByVehicle30 = await getRevenueByVehicleData(6, 30);
  const revenueByVehicle7 = await getRevenueByVehicleData(6, 7);
  const revenueByVehicle90 = await getRevenueByVehicleData(6, 90);
  const bookingTrendData = await getBookingTrendData(30);
  const bookingStatusDistribution30 = await getBookingStatusDistributionData(30);
  const bookingStatusDistribution7 = await getBookingStatusDistributionData(7);
  const bookingStatusDistribution90 = await getBookingStatusDistributionData(90);
  const topVehiclesByBookings30 = await getTopVehiclesByBookingsData(30, 6);
  const topVehiclesByBookings7 = await getTopVehiclesByBookingsData(7, 6);
  const topVehiclesByBookings90 = await getTopVehiclesByBookingsData(90, 6);

  const stats = [
    {
      title: "Total Vehicles",
      value: dashboardStats.totalVehicles.toLocaleString(),
      icon: Bike,
      description: "Active listings",
    },
    {
      title: "Total Bookings",
      value: dashboardStats.totalBookings.toLocaleString(),
      icon: Calendar,
      description: "All bookings",
    },
    {
      title: "Total Users",
      value: dashboardStats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardStats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      description: "From paid bookings",
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Analytical overview of the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4 mt-4">
        <h2 className="text-lg font-medium">Revenue & Financial Analytics</h2>
        <div className="space-y-4">
          <RevenueTrend initialData={revenueTrendData} />
          <RevenueByVehicle
            dataByRange={{
              "30d": revenueByVehicle30,
              "7d": revenueByVehicle7,
              "3m": revenueByVehicle90,
            }}
          />
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <h2 className="text-lg font-medium">Booking Analytics</h2>
        <BookingsTrend initialData={bookingTrendData} />
        <div className="grid gap-4 md:grid-cols-2">
          <BookingStatusDistribution
            dataByRange={{
              "30d": bookingStatusDistribution30,
              "7d": bookingStatusDistribution7,
              "3m": bookingStatusDistribution90,
            }}
          />
          <TopVehiclesByBookings
            dataByRange={{
              "30d": topVehiclesByBookings30,
              "7d": topVehiclesByBookings7,
              "3m": topVehiclesByBookings90,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default HostingDashboard;
