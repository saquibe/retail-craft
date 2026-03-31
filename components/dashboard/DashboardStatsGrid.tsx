// components/dashboard/DashboardStatsGrid.tsx
"use client";

import { memo } from "react";
import {
  IndianRupee,
  Receipt,
  Package,
  Users,
  Wallet,
  ShoppingCart,
  FileText,
  Boxes,
  Truck,
  CreditCard,
  Store,
  FolderOpen,
  TrendingUp,
  Calculator,
  Percent,
  PiggyBank,
} from "lucide-react";
import { StatCard } from "@/components/user/StatCard";
import { SectionTitle } from "@/components/user/SectionTitle";
import { DashboardStats } from "@/lib/api/dashboard";

interface DashboardStatsGridProps {
  stats: DashboardStats;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}

export const DashboardStatsGrid = memo(
  ({ stats, formatCurrency, formatNumber }: DashboardStatsGridProps) => {
    return (
      <>
        {/* Section 1 - Sales */}
        <SectionTitle
          title="Sales Overview"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Sales"
            value={stats.totalSales}
            icon={<IndianRupee className="w-5 h-5 text-indigo-600" />}
            formatter={formatCurrency}
          />
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<Receipt className="w-5 h-5 text-indigo-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="Sold Qty"
            value={stats.soldQty}
            icon={<Package className="w-5 h-5 text-indigo-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<Users className="w-5 h-5 text-indigo-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="To Receive"
            value={stats.toReceive}
            icon={<Wallet className="w-5 h-5 text-indigo-600" />}
            formatter={formatCurrency}
          />
        </div>

        {/* Section 2 - Purchase */}
        <SectionTitle
          title="Purchase Overview"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Purchase"
            value={stats.totalPurchase}
            icon={<IndianRupee className="w-5 h-5 text-green-600" />}
            formatter={formatCurrency}
          />
          <StatCard
            title="Total Bills"
            value={stats.totalBills}
            icon={<FileText className="w-5 h-5 text-green-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="Purchase Qty"
            value={stats.purchaseQty}
            icon={<Boxes className="w-5 h-5 text-green-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="Total Suppliers"
            value={stats.totalSuppliers}
            icon={<Truck className="w-5 h-5 text-green-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="To Pay"
            value={stats.toPay}
            icon={<CreditCard className="w-5 h-5 text-green-600" />}
            formatter={formatCurrency}
          />
        </div>

        {/* Section 3 - Inventory */}
        <SectionTitle
          title="Inventory Overview"
          icon={<Store className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Paid"
            value={stats.totalPaid}
            icon={<IndianRupee className="w-5 h-5 text-purple-600" />}
            formatter={formatCurrency}
          />
          <StatCard
            title="Total Expense"
            value={stats.totalExpense}
            icon={<PiggyBank className="w-5 h-5 text-purple-600" />}
            formatter={formatCurrency}
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Package className="w-5 h-5 text-purple-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="Stock Qty"
            value={stats.stockQty}
            icon={<Boxes className="w-5 h-5 text-purple-600" />}
            formatter={formatNumber}
          />
          <StatCard
            title="Stock Value"
            value={stats.stockValue}
            icon={<FolderOpen className="w-5 h-5 text-purple-600" />}
            formatter={formatCurrency}
          />
        </div>

        {/* Section 4 - Profit & Analytics */}
        <SectionTitle
          title="Profit & Analytics"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Gross Profit"
            value={stats.grossProfit}
            icon={<IndianRupee className="w-5 h-5 text-blue-600" />}
            formatter={formatCurrency}
          />
          <StatCard
            title="Avg Profit Margin"
            value={stats.avgProfitMargin}
            icon={<Calculator className="w-5 h-5 text-blue-600" />}
            formatter={formatCurrency}
          />
          <StatCard
            title="Avg Profit Margin %"
            value={stats.avgProfitMarginPercent}
            icon={<Percent className="w-5 h-5 text-blue-600" />}
            formatter={(val) => val.toFixed(1) + "%"}
          />
          <StatCard
            title="Avg Cart Value"
            value={stats.avgCartValue}
            icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
            formatter={formatCurrency}
          />
          <StatCard
            title="Avg Bills"
            value={stats.avgBills}
            icon={<Receipt className="w-5 h-5 text-blue-600" />}
            formatter={formatNumber}
          />
        </div>
      </>
    );
  },
);

DashboardStatsGrid.displayName = "DashboardStatsGrid";
