"use client";

import get from "lodash/get";
import last from "lodash/last";
import nth from "lodash/nth";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ReadingsTable } from "@/types/supabase";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface VitalTrendCardProps {
  title: string;
  icon: React.ReactNode;
  data: ReadingsTable[];
  dataKey: keyof ReadingsTable; // "heartRate" | "spo2" | "bodyTemp"
  color: string;
  unit: string;
  normalRange: string;
  paddingPercent?: number;
}

const VitalTrendCard = ({
  title,
  icon,
  data,
  dataKey,
  color,
  unit,
  normalRange,
  paddingPercent = 0.15,
}: VitalTrendCardProps) => {
  const transformedData = data.map((reading) => {
    const timestamp = new Date(reading.timestamp!);
    return {
      timelabel: timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: timestamp.getTime(),
      value: reading[dataKey] as number,
    };
  });

  const latestReading = last(transformedData);
  const previousReading = nth(transformedData, -2);
  const latestValue = get(latestReading, "value", 0);
  const previousValue = get(previousReading, "value", 0);
  const trend = latestValue > previousValue ? "up" : "down";
  const trendColor = trend === "up" ? "text-red-500" : "text-green-500";

  const yAxisDomain = () => {
    const values = transformedData
      .map((d) => d.value)
      .filter((v) => typeof v === "number");
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const yMin = Math.max(0, Math.floor(dataMin * (1 - paddingPercent)));
    const yMax = Math.ceil(dataMax * (1 + paddingPercent));

    return [yMin, yMax];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {trend === "up" ? (
            <TrendingUp className={`w-4 h-4 ${trendColor}`} />
          ) : (
            <TrendingDown className={`w-4 h-4 ${trendColor}`} />
          )}
          <Badge variant="outline" className="text-xs">
            {normalRange}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 mb-4">
          <div className="text-2xl font-bold ">
            {latestValue} {unit}
          </div>
          <p className="text-xs text-muted-foreground">
            Current reading • Normal range: {normalRange}
          </p>
          {data && data.length > 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              {new Date(data[0].timestamp!).toLocaleDateString("en-US", {
                dateStyle: "full",
              })}{" "}
              -{" "}
              {new Date(data[data.length - 1].timestamp!).toLocaleDateString(
                "en-US",
                {
                  dateStyle: "full",
                },
              )}
            </p>
          )}{" "}
        </div>

        <ChartContainer
          config={{
            value: { label: title, color },
          }}
          className="h-[200px] w-full"
        >
          <LineChart data={transformedData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="timelabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit={` ${unit}`}
              domain={yAxisDomain()}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="value"
                  labelFormatter={(_, payload) => {
                    const ts = payload?.[0]?.payload?.timestamp;
                    return ts
                      ? new Date(ts).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";
                  }}
                />
              }
            />{" "}
            <Line
              type="natural"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: color, strokeWidth: 1 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default VitalTrendCard;
