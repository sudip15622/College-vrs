"use client";

import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Legend,
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
import { BookingTrendDataPoint } from "@/lib/actions/booking";

type RangeOption = "30d" | "7d" | "3m";

const rangeConfig: Record<RangeOption, { label: string; days: number }> = {
  "30d": { label: "Last 30 days", days: 30 },
  "7d": { label: "Last week", days: 7 },
  "3m": { label: "Last 3 months", days: 90 },
};

interface BookingsTrendProps {
  initialData: BookingTrendDataPoint[];
}

const BookingsTrend = ({ initialData }: BookingsTrendProps) => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("30d");
  const chartConfig = rangeConfig[selectedRange];
  const data = useMemo(
    () => initialData.slice(-chartConfig.days),
    [chartConfig.days, initialData],
  );
  const xAxisInterval = selectedRange === "3m" ? 9 : selectedRange === "30d" ? 4 : 0;

  const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);
  const peakBookings = data.reduce(
    (max, item) => (item.bookings > max ? item.bookings : max),
    0,
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bookings Trend</CardTitle>
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
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                interval={xAxisInterval}
                axisLine={{
                  stroke: "var(--primary)",
                  strokeWidth: 0.5,
                }}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={{
                  stroke: "var(--primary)",
                  strokeWidth: 0.5,
                }}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
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
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                  opacity: 1,
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                labelStyle={{
                  color: "hsl(var(--foreground))",
                  fontWeight: 600,
                }}
                formatter={(value) => {
                  const normalizedValue = Array.isArray(value) ? value[0] : value ?? 0;
                  return `${Number(normalizedValue).toLocaleString()} bookings`;
                }}
                cursor={{
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Legend />

              <Area
                type="monotone"
                dataKey="bookings"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#colorBookings)"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 7, strokeWidth: 2 }}
                name="Daily bookings"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Average Daily</p>
              <p className="text-lg font-semibold">
                {data.length ? Math.round(totalBookings / data.length) : 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Demand</p>
              <p className="text-lg font-semibold">{peakBookings}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingsTrend;
