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
import { RevenueByVehicleDataPoint } from "@/lib/actions/booking";

type RangeOption = "30d" | "7d" | "3m";

interface RevenueByVehicleProps {
  dataByRange: Record<RangeOption, RevenueByVehicleDataPoint[]>;
}

const RevenueByVehicle = ({ dataByRange }: RevenueByVehicleProps) => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("30d");

  const chartData = useMemo(
    () => dataByRange[selectedRange],
    [dataByRange, selectedRange],
  );

  if (!chartData.length) {
    return (
      <Card className="col-span-3 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue by Vehicle</CardTitle>
            <Select
              value={selectedRange}
              onValueChange={(value) => setSelectedRange(value as RangeOption)}
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No revenue data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const topVehicle = chartData.reduce((top, current) =>
    current.revenue > top.revenue ? current : top,
  );
  const lastVehicle = chartData.reduce((last, current) =>
    current.revenue < last.revenue ? current : last,
  );

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>Revenue by Vehicle</CardTitle>
          <Select
            value={selectedRange}
            onValueChange={(value) => setSelectedRange(value as RangeOption)}
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
      </CardHeader>
      <CardContent className="h-full w-full">
        <ResponsiveContainer width="100%" height={320}>
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
              tickFormatter={(value) => `${Number(value).toLocaleString()}`}
              label={{
                value: "Revenue (Rs.)",
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
              formatter={(value) => `Rs. ${Number(value).toLocaleString()}`}
              cursor={false}
            />
            <Bar
              dataKey="revenue"
              fill="hsl(var(--primary) / 0.55)"
              activeBar={{ fill: "hsl(var(--primary))" }}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Top Vehicle</p>
            <p className="text-lg font-semibold truncate">
              {topVehicle.vehicle}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Vehicle</p>
            <p className="text-lg font-semibold truncate">
              {lastVehicle.vehicle}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueByVehicle;
