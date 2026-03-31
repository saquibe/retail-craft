// components/dashboard/DashboardHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Loader2 } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  dateRange: "today" | "week" | "month" | "year";
  onDateRangeChange: (range: "today" | "week" | "month" | "year") => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const DashboardHeader = ({
  userName,
  dateRange,
  onDateRangeChange,
  onRefresh,
  refreshing,
}: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {userName || "User"}! Here's your business overview.
        </p>
      </div>
      <div className="flex gap-2">
        <Select
          value={dateRange}
          onValueChange={(value) =>
            onDateRangeChange(value as "today" | "week" | "month" | "year")
          }
        >
          <SelectTrigger className="w-[180px] h-10 bg-background cursor-pointer">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="default"
          onClick={onRefresh}
          disabled={refreshing}
          className="h-10"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
