"use client";

import React, { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatusDistributionDataPoint } from "@/lib/actions/booking";

type RangeOption = "30d" | "7d" | "3m";

interface BookingStatusDistributionProps {
  dataByRange: Record<RangeOption, BookingStatusDistributionDataPoint[]>;
}

const statusDisplayName: Record<BookingStatusDistributionDataPoint["status"], string> = {
  Pending: "Pending bookings",
  Confirmed: "Confirmed Bookings (upcoming)",
  Active: "Active bookings",
  Completed: "Completed bookings",
  Cancelled: "Cancelled bookings",
};

const statusColorMap: Record<BookingStatusDistributionDataPoint["status"], string> = {
  Pending: "var(--chart-1)",
  Confirmed: "var(--muted-foreground)",
  Active: "var(--chart-5)",
  Completed: "var(--primary)",
  Cancelled: "var(--destructive)",
};

const BookingStatusDistribution = ({ dataByRange }: BookingStatusDistributionProps) => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("30d");

  const chartData = useMemo(
    () =>
      dataByRange[selectedRange].map((item) => ({
        ...item,
        label: statusDisplayName[item.status],
      })),
    [dataByRange, selectedRange],
  );

  const totalBookings = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Booking Status Distribution</CardTitle>
            <div className="flex mt-2">
              <Select
                value={selectedRange}
                onValueChange={(value) =>
                  setSelectedRange(value as RangeOption)
                }
              >
                <SelectTrigger className="w-37.5">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="7d">Last week</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalBookings}</p>
            <p className="text-xs text-muted-foreground">Total bookings</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={2}
            >
              {chartData.map((item) => (
                <Cell key={item.status} fill={statusColorMap[item.status]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px 14px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                opacity: 1,
              }}
              formatter={(value, _name, props) => [
                `${Number(value).toLocaleString()} bookings`,
                props.payload?.label,
              ]}
            />
            <Legend
              formatter={(value) => (
                <span className="text-muted-foreground text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BookingStatusDistribution;
