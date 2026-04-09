"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { TransactionTable } from "@/components/user/TransactionTable";
import type { Transaction } from "@/components/user/TransactionTable";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import UserDashboardSkeleton from "@/components/skeletons/UserDashboardSkeleton";
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    dashboardData,
    loading,
    refreshing,
    dateRange,
    changeDateRange,
    refresh,
    markReceivableAsPaid,
    markPayableAsPaid,
    updatingPayment,
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

  const handleViewDetails = (id: string, type: "receivable" | "payable") => {
    if (type === "receivable") {
      router.push(`/user/customer-invoices?view=${id}`);
    } else {
      router.push(`/user/supplier-invoices?view=${id}`);
    }
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

      {receivables.length > 0 ? (
        <TransactionTable
          type="receivable"
          data={receivables as Transaction[]}
          onViewDetails={(id) => handleViewDetails(id, "receivable")}
          onMarkPaid={markReceivableAsPaid}
          updatingPaymentId={updatingPayment}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No receivables found
        </div>
      )}

      {payables.length > 0 ? (
        <TransactionTable
          type="payable"
          data={
            payables.map((p) => ({
              id: p.id,
              supplierName: p.supplierName,
              billNo: p.billNo,
              invoiceDate: p.billDate,
              dueDate: p.dueDate,
              amount: p.amount,
              paidAmount: p.paidAmount,
              pendingAmount: p.pendingAmount,
              status: p.status,
              paymentMode: p.paymentMode,
              daysSinceInvoice: p.daysSinceInvoice,
              invoiceStatus: p.invoiceStatus, // Pass invoice status
            })) as Transaction[]
          }
          onViewDetails={(id) => handleViewDetails(id, "payable")}
          onMarkPaid={markPayableAsPaid}
          updatingPaymentId={updatingPayment}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No payables found
        </div>
      )}
    </div>
  );
}
