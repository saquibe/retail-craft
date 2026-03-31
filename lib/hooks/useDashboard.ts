// lib/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { DashboardData } from "@/lib/api/dashboard";
import toast from "react-hot-toast";
import { dashboardService } from "@/app/services/dashboardService";

export const useDashboard = (
  initialDateRange?: "today" | "week" | "month" | "year",
) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(initialDateRange || "month");
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.fetchDashboardData(dateRange);
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const changeDateRange = useCallback(
    (range: "today" | "week" | "month" | "year") => {
      setDateRange(range);
    },
    [],
  );

  return {
    dashboardData,
    loading,
    refreshing,
    dateRange,
    changeDateRange,
    refresh,
  };
};
