// components/dashboard/DashboardHeader.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import toast from "react-hot-toast";

interface DashboardHeaderProps {
  userName?: string;
  dateRange: "today" | "week" | "month" | "year" | "custom";
  customStartDate?: Date;
  customEndDate?: Date;
  onDateRangeChange: (
    range: "today" | "week" | "month" | "year" | "custom",
    startDate?: Date,
    endDate?: Date,
  ) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const DashboardHeader = ({
  userName,
  dateRange,
  customStartDate,
  customEndDate,
  onDateRangeChange,
  onRefresh,
  refreshing,
}: DashboardHeaderProps) => {
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    customStartDate,
  );
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(
    customEndDate,
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  // Get today's date (without time) for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleCustomDateApply = () => {
    if (tempStartDate && tempEndDate) {
      onDateRangeChange("custom", tempStartDate, tempEndDate);
      setIsCalendarOpen(false);
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  const handlePresetClick = (range: "today" | "week" | "month" | "year") => {
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    setSelecting("start");
    onDateRangeChange(range);
    setIsCalendarOpen(false);
  };

  const getDateRangeDisplay = () => {
    if (dateRange === "custom" && customStartDate && customEndDate) {
      return `${format(customStartDate, "dd MMM yyyy")} - ${format(
        customEndDate,
        "dd MMM yyyy",
      )}`;
    }
    switch (dateRange) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      default:
        return "Select Range";
    }
  };

  // Disable dates for end date calendar
  const getEndDateDisabled = (date: Date) => {
    // Disable dates before start date
    if (tempStartDate && date < tempStartDate) return true;
    // Disable dates after today
    if (date > today) return true;
    return false;
  };

  // Disable dates for start date calendar
  const getStartDateDisabled = (date: Date) => {
    // Disable dates after today
    if (date > today) return true;
    return false;
  };

  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {userName || "User"}! Here's your business overview.
        </p>
      </div>
      <div className="flex gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[260px] justify-start text-left font-normal cursor-pointer"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDateRangeDisplay()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-4 border-b">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick("today")}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick("week")}
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick("month")}
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick("year")}
                >
                  This Year
                </Button>
              </div>
              <div className="text-sm text-gray-500 mt-3 pt-2 border-t">
                Custom Range
              </div>
            </div>
            <div className="p-4">
              <div className="flex gap-6">
                {/* Start Date Calendar */}
                <div>
                  <div className="text-sm font-medium mb-2 text-center">
                    {selecting === "start"
                      ? "✓ Select Start Date"
                      : "Start Date"}
                  </div>
                  <Calendar
                    mode="single"
                    selected={tempStartDate}
                    onSelect={(date) => {
                      setTempStartDate(date);
                      setSelecting("end");
                    }}
                    disabled={getStartDateDisabled}
                    className="rounded-lg border"
                  />
                </div>
                {/* End Date Calendar */}
                <div>
                  <div className="text-sm font-medium mb-2 text-center">
                    {selecting === "end" ? "✓ Select End Date" : "End Date"}
                  </div>
                  <Calendar
                    mode="single"
                    selected={tempEndDate}
                    onSelect={setTempEndDate}
                    disabled={getEndDateDisabled}
                    className="rounded-lg border"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTempStartDate(customStartDate);
                    setTempEndDate(customEndDate);
                    setSelecting("start");
                    setIsCalendarOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomDateApply}
                  disabled={!tempStartDate || !tempEndDate}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
