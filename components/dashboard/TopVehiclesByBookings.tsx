"use client";

import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopVehiclesByBookingsDataPoint } from "@/lib/actions/booking";

type RangeOption = "30d" | "7d" | "3m";

interface TopVehiclesByBookingsProps {
  dataByRange: Record<RangeOption, TopVehiclesByBookingsDataPoint[]>;
}

const TopVehiclesByBookings = ({ dataByRange }: TopVehiclesByBookingsProps) => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("30d");

  const chartData = useMemo(
    () => dataByRange[selectedRange],
    [dataByRange, selectedRange],
  );

  const totalBookings = chartData.reduce((sum, item) => sum + item.bookings, 0);

  const topVehicle =
    chartData.length > 0
      ? chartData.reduce((top, current) =>
          current.bookings > top.bookings ? current : top,
        )
      : null;

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Vehicles by Bookings</CardTitle>
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
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
            >
              <XAxis
                dataKey="vehicle"
                axisLine={{
                  stroke: "var(--primary)",
                  strokeWidth: 0.5,
                }}
                angle={-25}
                textAnchor="end"
                interval={0}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                height={70}
              />
              <YAxis
                axisLine={{
                  stroke: "var(--primary)",
                  strokeWidth: 0.5,
                }}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                allowDecimals={false}
                tickFormatter={(value) => `${Number(value).toLocaleString()}`}
                label={{
                  value: "Bookings",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fontSize: "12px",
                    fill: "hsl(var(--foreground))",
                  },
                }}
              />
              <Tooltip
                wrapperStyle={{ zIndex: 50 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                }}
                formatter={(value) => `${Number(value).toLocaleString()} bookings`}
                cursor={false}
              />
              <Bar
                dataKey="bookings"
                fill="hsl(var(--primary) / 0.55)"
                activeBar={{ fill: "hsl(var(--primary))" }}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">No booking data available</p>
        )}

        <div className="pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground">Most booked vehicle</p>
          <p className="text-lg font-semibold truncate">
            {topVehicle?.vehicle || "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopVehiclesByBookings;
