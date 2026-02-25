"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  formatter?: (value: number) => string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  formatter = (val) => val.toString(),
}: StatCardProps) {
  const numericValue =
    typeof value === "string" ? parseFloat(value) || 0 : value;

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">{icon}</div>
          {trend && (
            <div
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600",
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{formatter(numericValue)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
