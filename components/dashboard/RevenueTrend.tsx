"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RangeOption = "30d" | "7d" | "3m";

const rangeConfig: Record<RangeOption, { label: string; days: number }> = {
  "30d": { label: "Last 30 days", days: 30 },
  "7d": { label: "Last week", days: 7 },
  "3m": { label: "Last 3 months", days: 90 },
};

const generateDemoRevenueData = (days: number) => {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const dayOffset = days - 1 - index;
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);

    const seasonalFactor = Math.sin(index / 3.5) * 1800;
    const trendFactor = index * 22;
    const noiseFactor = (index * 137) % 1900;
    const revenue = Math.max(
      1200,
      Math.round(3200 + seasonalFactor + trendFactor + noiseFactor),
    );

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue,
    };
  });
};

const RevenueTrend = () => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("30d");
  const chartConfig = rangeConfig[selectedRange];
  const data = useMemo(
    () => generateDemoRevenueData(chartConfig.days),
    [chartConfig.days],
  );
  const xAxisInterval = selectedRange === "30d" ? 4 : 0;

  // Stats
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const averageRevenue = Math.round(totalRevenue / data.length);
  const maxRevenue = Math.max(...data.map((item) => item.revenue));

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Trend</CardTitle>
            {/* <p className="text-xs text-muted-foreground mt-1">{chartConfig.label}</p> */}
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
            <p className="text-2xl font-bold">
              Rs. {totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              {/* Gradient */}
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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

              {/* Tooltip */}
              <XAxis
                dataKey="date"
                interval={xAxisInterval}
                axisLine={{
                  stroke: "var(--border)",
                  strokeWidth: 1,
                }}
                tickLine={false}
                tick={{
                  fill: "var(--border))",
                  fontSize: 12,
                }}
              />

              <YAxis
                axisLine={{
                  stroke: "var(--border)",
                  strokeWidth: 1,
                }}
                tickLine={false}
                tick={{
                  fill: "(var(--border)",
                  fontSize: 12,
                }}
                label={{
                  value: "Revenue (Rs.)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fontSize: "12px",
                    fill: "(var(--foreground)",
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
                itemStyle={{
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{
                  color: "hsl(var(--foreground))",
                  fontWeight: 600,
                }}
                formatter={(value: any) =>
                  `Rs. ${Number(value).toLocaleString()}`
                }
                cursor={{
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              <Legend />

              {/* Area */}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#colorRevenue)"
                dot={{
                  fill: "hsl(var(--primary))",
                  r: 4,
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                }}
                name="Daily Revenue"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Average Daily</p>
              <p className="text-lg font-semibold">
                Rs. {averageRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Revenue</p>
              <p className="text-lg font-semibold">
                Rs. {maxRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTrend;
