// app/(dashboard)/user/dashboard/page.tsx
"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { TransactionTable } from "@/components/user/TransactionTable";
import type { Transaction } from "@/components/user/TransactionTable";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { Loader2 } from "lucide-react";
import UserDashboardSkeleton from "@/components/skeletons/UserDashboardSkeleton";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const {
    dashboardData,
    loading,
    refreshing,
    dateRange,
    changeDateRange,
    refresh,
  } = useDashboard("month");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const handleViewDetails = (id: string) => {
    console.log("View details:", id);
  };

  if (loading || !dashboardData) {
    return <UserDashboardSkeleton />;
  }

  const { stats, receivables, payables } = dashboardData;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <DashboardHeader
        userName={user?.name}
        dateRange={dateRange}
        onDateRangeChange={changeDateRange}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <DashboardStatsGrid
        stats={stats}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
      />

      <TransactionTable
        type="receivable"
        data={receivables as Transaction[]}
        onViewDetails={handleViewDetails}
      />

      <TransactionTable
        type="payable"
        data={
          payables.map((p) => ({
            ...p,
            invoiceDate: p.billDate,
          })) as Transaction[]
        }
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
