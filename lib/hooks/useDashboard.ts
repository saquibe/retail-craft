"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCompletedBillings,
  Billing,
  updatePaymentStatus,
} from "@/lib/api/billing";
import {
  getCompletedPurchases,
  PurchaseInvoice,
  updatePurchasePaymentStatus,
} from "@/lib/api/purchases";
import { getProducts, Product } from "@/lib/api/products";
import { getCustomers, Customer } from "@/lib/api/customers";
import { getSuppliers, Supplier } from "@/lib/api/suppliers";
import toast from "react-hot-toast";

export interface DashboardStats {
  totalSales: number;
  totalInvoices: number;
  soldQty: number;
  totalCustomers: number;
  toReceive: number;
  totalPurchase: number;
  totalBills: number;
  purchaseQty: number;
  totalSuppliers: number;
  toPay: number;
  totalPaid: number;
  totalExpense: number;
  totalProducts: number;
  stockQty: number;
  stockValue: number;
  grossProfit: number;
  avgProfitMargin: number;
  avgProfitMarginPercent: number;
  avgCartValue: number;
  avgBills: number;
}

export interface ReceivableTransaction {
  id: string;
  customerName: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "pending" | "paid";
  paymentMode?: string;
  daysOverdue?: number;
}

export interface PayableTransaction {
  id: string;
  supplierName: string;
  billNo: string;
  billDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "pending" | "paid";
  paymentMode?: string;
  daysOverdue?: number;
}

interface DashboardData {
  stats: DashboardStats;
  receivables: ReceivableTransaction[];
  payables: PayableTransaction[];
}

export function useDashboard(
  initialRange: "today" | "week" | "month" | "year" = "month",
) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(initialRange);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);

  const calculateDueDate = (
    createdAt: string,
    paymentMode?: string,
  ): string => {
    const created = new Date(createdAt);
    if (paymentMode === "Pay Later") {
      const due = new Date(created);
      due.setDate(due.getDate() + 30);
      return due.toISOString();
    }
    return created.toISOString();
  };

  const calculateDaysOverdue = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateStatus = (pendingAmount: number): "pending" | "paid" => {
    return pendingAmount > 0 ? "pending" : "paid";
  };

  // Function to mark payment as paid for Receivable (Billing)
  const markReceivableAsPaid = async (id: string): Promise<void> => {
    setUpdatingPayment(id);
    try {
      const response = await updatePaymentStatus(id, "Paid");
      if (response.success) {
        toast.success("Payment marked as paid successfully");
        await fetchDashboardData();
      } else {
        toast.error(response.message || "Failed to update payment status");
      }
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update payment status",
      );
    } finally {
      setUpdatingPayment(null);
    }
  };

  // Function to mark payment as paid for Payable (Purchase)
  const markPayableAsPaid = async (id: string): Promise<void> => {
    setUpdatingPayment(id);
    try {
      const response = await updatePurchasePaymentStatus(id, "Paid");
      if (response.success) {
        toast.success("Payment marked as paid successfully");
        await fetchDashboardData();
      } else {
        toast.error(response.message || "Failed to update payment status");
      }
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update payment status",
      );
    } finally {
      setUpdatingPayment(null);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch all required data in parallel
      const [
        billingsResponse,
        purchasesResponse,
        productsResponse,
        customersResponse,
        suppliersResponse,
      ] = await Promise.all([
        getCompletedBillings(),
        getCompletedPurchases(),
        getProducts("All"),
        getCustomers(),
        getSuppliers(),
      ]);

      // Calculate date range filter
      const now = new Date();
      let startDate: Date;
      switch (dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default: // month
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      // Process Billings for Sales Stats
      let totalSales = 0;
      let totalInvoices = 0;
      let soldQty = 0;
      let toReceive = 0;
      let totalPaid = 0;
      let grossProfit = 0;
      let totalCartValue = 0;

      const receivables: ReceivableTransaction[] = [];

      if (billingsResponse.success && billingsResponse.data) {
        const filteredBillings = billingsResponse.data.filter(
          (b: Billing) => new Date(b.createdAt) >= startDate,
        );

        totalInvoices = filteredBillings.length;

        filteredBillings.forEach((billing: Billing) => {
          const finalAmount = billing.finalTotal || billing.grandTotal;
          const paidAmount = billing.paymentStatus === "Paid" ? finalAmount : 0;
          const pendingAmount = finalAmount - paidAmount;

          totalSales += finalAmount;
          totalPaid += paidAmount;
          toReceive += pendingAmount;
          totalCartValue += finalAmount;

          // Calculate sold quantity
          billing.items?.forEach((item) => {
            soldQty += item.quantity;
          });

          // Calculate gross profit (simplified - you may need purchase price)
          billing.items?.forEach((item) => {
            const profit = item.price * item.quantity * 0.2; // Assuming 20% profit margin
            grossProfit += profit;
          });

          // Add to receivables if pending amount > 0 or Pay Later
          if (pendingAmount > 0 || billing.paymentMode === "Pay Later") {
            const dueDate = calculateDueDate(
              billing.createdAt,
              billing.paymentMode,
            );
            receivables.push({
              id: billing._id,
              customerName: billing.customerId?.name || "Unknown",
              invoiceNo: billing.invoiceNumber,
              invoiceDate: billing.createdAt,
              dueDate: dueDate,
              amount: finalAmount,
              paidAmount: paidAmount,
              pendingAmount: pendingAmount,
              status: calculateStatus(pendingAmount),
              paymentMode: billing.paymentMode,
              daysOverdue: calculateDaysOverdue(dueDate),
            });
          }
        });
      }

      // Process Purchases for Purchase Stats
      let totalPurchase = 0;
      let totalBills = 0;
      let purchaseQty = 0;
      let toPay = 0;
      let totalExpense = 0;

      const payables: PayableTransaction[] = [];

      if (purchasesResponse.success && purchasesResponse.data) {
        const filteredPurchases = purchasesResponse.data.filter(
          (p: PurchaseInvoice) => new Date(p.invoiceDate) >= startDate,
        );

        totalBills = filteredPurchases.length;

        filteredPurchases.forEach((purchase: PurchaseInvoice) => {
          const finalAmount = purchase.finalTotal || purchase.grandTotal;
          const paidAmount =
            purchase.paymentStatus === "Paid" ? finalAmount : 0;
          const pendingAmount = finalAmount - paidAmount;

          totalPurchase += finalAmount;
          totalExpense += paidAmount;
          toPay += pendingAmount;

          // Calculate purchase quantity
          purchase.items?.forEach((item) => {
            purchaseQty += item.quantity;
          });

          // Add to payables if pending amount > 0 or Pay Later
          if (pendingAmount > 0 || purchase.paymentMode === "Pay Later") {
            const dueDate = calculateDueDate(
              purchase.invoiceDate,
              purchase.paymentMode,
            );
            payables.push({
              id: purchase._id,
              supplierName: purchase.supplierId?.name || "Unknown",
              billNo: purchase.invoiceNumber,
              billDate: purchase.invoiceDate,
              dueDate: dueDate,
              amount: finalAmount,
              paidAmount: paidAmount,
              pendingAmount: pendingAmount,
              status: calculateStatus(pendingAmount),
              paymentMode: purchase.paymentMode,
              daysOverdue: calculateDaysOverdue(dueDate),
            });
          }
        });
      }

      // Process Products for Inventory Stats
      let totalProducts = 0;
      let stockQty = 0;
      let stockValue = 0;

      if (productsResponse.success && productsResponse.data) {
        totalProducts = productsResponse.data.length;
        productsResponse.data.forEach((product: Product) => {
          stockQty += product.quantity;
          stockValue += product.quantity * product.purchasePrice;
        });
      }

      // Calculate averages
      const avgCartValue =
        totalInvoices > 0 ? totalCartValue / totalInvoices : 0;
      const avgBills = totalInvoices > 0 ? totalInvoices : 0;
      const avgProfitMargin =
        totalInvoices > 0 ? grossProfit / totalInvoices : 0;
      const avgProfitMarginPercent =
        totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

      setDashboardData({
        stats: {
          totalSales,
          totalInvoices,
          soldQty,
          totalCustomers: customersResponse.data?.length || 0,
          toReceive,
          totalPurchase,
          totalBills,
          purchaseQty,
          totalSuppliers: suppliersResponse.data?.length || 0,
          toPay,
          totalPaid,
          totalExpense,
          totalProducts,
          stockQty,
          stockValue,
          grossProfit,
          avgProfitMargin,
          avgProfitMarginPercent,
          avgCartValue,
          avgBills,
        },
        receivables,
        payables,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const changeDateRange = (range: "today" | "week" | "month" | "year") => {
    setDateRange(range);
    setLoading(true);
    fetchDashboardData();
  };

  const refresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return {
    dashboardData,
    loading,
    refreshing,
    dateRange,
    changeDateRange,
    refresh,
    markReceivableAsPaid,
    markPayableAsPaid,
    updatingPayment,
  };
}
