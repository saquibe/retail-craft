"use client";

import { useState, useEffect } from "react";
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
  PiggyBank,
  TrendingUp,
  Percent,
  BarChart3,
  Calculator,
  CreditCard,
  Store,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/user/StatCard";
import { SectionTitle } from "@/components/user/SectionTitle";
import { TransactionTable } from "@/components/user/TransactionTable";
import { useAuth } from "@/lib/context/AuthContext";
import { DashboardData } from "@/types/dashboard.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - replace with actual API calls
const mockDashboardData: DashboardData = {
  stats: {
    // Section 1 - Sales
    totalSales: 1250000,
    totalInvoices: 145,
    soldQty: 2340,
    totalCustomers: 89,
    toReceive: 450000,

    // Section 2 - Purchase
    totalPurchase: 890000,
    totalBills: 98,
    purchaseQty: 1870,
    totalSuppliers: 34,
    toPay: 280000,

    // Section 3 - Inventory
    totalPaid: 610000,
    totalExpense: 45000,
    totalProducts: 256,
    stockQty: 3450,
    stockValue: 780000,

    // Section 4 - Profit & Analytics
    grossProfit: 360000,
    avgProfitMargin: 1250,
    avgProfitMarginPercent: 28.5,
    avgCartValue: 8620,
    avgBills: 45,
  },
  receivables: [
    {
      id: "1",
      customerName: "Rajesh Traders",
      invoiceNo: "INV-2024-001",
      invoiceDate: "2024-03-15",
      dueDate: "2024-04-14",
      amount: 125000,
      paidAmount: 75000,
      pendingAmount: 50000,
      status: "partial",
    },
    {
      id: "2",
      customerName: "Sharma Enterprises",
      invoiceNo: "INV-2024-002",
      invoiceDate: "2024-03-10",
      dueDate: "2024-04-09",
      amount: 85000,
      paidAmount: 85000,
      pendingAmount: 0,
      status: "pending",
    },
    {
      id: "3",
      customerName: "Patel & Sons",
      invoiceNo: "INV-2024-003",
      invoiceDate: "2024-03-01",
      dueDate: "2024-03-31",
      amount: 210000,
      paidAmount: 100000,
      pendingAmount: 110000,
      status: "overdue",
    },
    {
      id: "4",
      customerName: "Gupta General Store",
      invoiceNo: "INV-2024-004",
      invoiceDate: "2024-03-18",
      dueDate: "2024-04-17",
      amount: 45000,
      paidAmount: 0,
      pendingAmount: 45000,
      status: "pending",
    },
    {
      id: "5",
      customerName: "Verma Agencies",
      invoiceNo: "INV-2024-005",
      invoiceDate: "2024-03-12",
      dueDate: "2024-04-11",
      amount: 95000,
      paidAmount: 50000,
      pendingAmount: 45000,
      status: "partial",
    },
    {
      id: "6",
      customerName: "Singh Electricals",
      invoiceNo: "INV-2024-006",
      invoiceDate: "2024-03-05",
      dueDate: "2024-04-04",
      amount: 155000,
      paidAmount: 155000,
      pendingAmount: 0,
      status: "pending",
    },
  ],
  payables: [
    {
      id: "1",
      supplierName: "ABC Suppliers",
      billNo: "BILL-2024-001",
      billDate: "2024-03-14",
      dueDate: "2024-04-13",
      amount: 95000,
      paidAmount: 50000,
      pendingAmount: 45000,
      status: "partial",
    },
    {
      id: "2",
      supplierName: "XYZ Corporation",
      billNo: "BILL-2024-002",
      billDate: "2024-03-08",
      dueDate: "2024-04-07",
      amount: 125000,
      paidAmount: 125000,
      pendingAmount: 0,
      status: "pending",
    },
    {
      id: "3",
      supplierName: "PQR Industries",
      billNo: "BILL-2024-003",
      billDate: "2024-02-28",
      dueDate: "2024-03-29",
      amount: 185000,
      paidAmount: 100000,
      pendingAmount: 85000,
      status: "overdue",
    },
    {
      id: "4",
      supplierName: "LMN Traders",
      billNo: "BILL-2024-004",
      billDate: "2024-03-16",
      dueDate: "2024-04-15",
      amount: 65000,
      paidAmount: 0,
      pendingAmount: 65000,
      status: "pending",
    },
    {
      id: "5",
      supplierName: "EFG Enterprises",
      billNo: "BILL-2024-005",
      billDate: "2024-03-11",
      dueDate: "2024-04-10",
      amount: 155000,
      paidAmount: 75000,
      pendingAmount: 80000,
      status: "partial",
    },
  ],
};

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "year"
  >("month");

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await dashboardService.getDashboardData(user?.branchId);
      // setDashboardData(response);

      // Using mock data for now
      setTimeout(() => {
        setDashboardData(mockDashboardData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  const handleViewReceivable = (id: string) => {
    console.log("View receivable details:", id);
    // Navigate to invoice details
  };

  const handleViewPayable = (id: string) => {
    console.log("View payable details:", id);
    // Navigate to bill details
  };

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

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats, receivables, payables } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.name || "User"}! Here's your business overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={dateRange}
            onValueChange={(value) =>
              setDateRange(value as "today" | "week" | "month" | "year")
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
        </div>
      </div>

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
          trend={{ value: 12.5, isPositive: true }}
          formatter={formatCurrency}
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={<Receipt className="w-5 h-5 text-indigo-600" />}
          trend={{ value: 8.3, isPositive: true }}
          formatter={formatNumber}
        />
        <StatCard
          title="Sold Qty"
          value={stats.soldQty}
          icon={<Package className="w-5 h-5 text-indigo-600" />}
          trend={{ value: 5.2, isPositive: true }}
          formatter={formatNumber}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          trend={{ value: 15.8, isPositive: true }}
          formatter={formatNumber}
        />
        <StatCard
          title="To Receive"
          value={stats.toReceive}
          icon={<Wallet className="w-5 h-5 text-indigo-600" />}
          trend={{ value: 3.2, isPositive: false }}
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
          trend={{ value: 7.8, isPositive: true }}
          formatter={formatCurrency}
        />
        <StatCard
          title="Total Bills"
          value={stats.totalBills}
          icon={<FileText className="w-5 h-5 text-green-600" />}
          trend={{ value: 4.5, isPositive: true }}
          formatter={formatNumber}
        />
        <StatCard
          title="Purchase Qty"
          value={stats.purchaseQty}
          icon={<Boxes className="w-5 h-5 text-green-600" />}
          trend={{ value: 6.7, isPositive: true }}
          formatter={formatNumber}
        />
        <StatCard
          title="Total Suppliers"
          value={stats.totalSuppliers}
          icon={<Truck className="w-5 h-5 text-green-600" />}
          trend={{ value: 10.2, isPositive: true }}
          formatter={formatNumber}
        />
        <StatCard
          title="To Pay"
          value={stats.toPay}
          icon={<CreditCard className="w-5 h-5 text-green-600" />}
          trend={{ value: 2.1, isPositive: true }}
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
          trend={{ value: 1.5, isPositive: false }}
          formatter={formatCurrency}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="w-5 h-5 text-purple-600" />}
          trend={{ value: 12.3, isPositive: true }}
          formatter={formatNumber}
        />
        <StatCard
          title="Stock Qty"
          value={stats.stockQty}
          icon={<Boxes className="w-5 h-5 text-purple-600" />}
          trend={{ value: 3.8, isPositive: true }}
          formatter={formatNumber}
        />
        <StatCard
          title="Stock Value"
          value={stats.stockValue}
          icon={<FolderOpen className="w-5 h-5 text-purple-600" />}
          trend={{ value: 5.6, isPositive: true }}
          formatter={formatCurrency}
        />
      </div>

      {/* Section 4 - Profit & Analytics */}
      <SectionTitle
        title="Profit & Analytics"
        icon={<BarChart3 className="w-5 h-5" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Gross Profit"
          value={stats.grossProfit}
          icon={<IndianRupee className="w-5 h-5 text-blue-600" />}
          trend={{ value: 18.5, isPositive: true }}
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

      {/* Receivables Table */}
      <div className="mt-8">
        <TransactionTable
          type="receivable"
          data={receivables}
          onViewDetails={handleViewReceivable}
          onDownload={(id) => console.log("Download invoice:", id)}
        />
      </div>

      {/* Payables Table */}
      <div className="mt-8">
        <TransactionTable
          type="payable"
          data={payables.map((payable) => ({
            ...payable,
            invoiceDate: payable.billDate,
          }))}
          onViewDetails={handleViewPayable}
          onDownload={(id) => console.log("Download bill:", id)}
        />
      </div>
    </div>
  );
}
