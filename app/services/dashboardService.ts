// services/dashboardService.ts
import { Billing, getCompletedBillings } from "@/lib/api/billing";
import { getProducts, Product } from "@/lib/api/products";
import { getCustomers, Customer } from "@/lib/api/customers";
import { getSuppliers, Supplier } from "@/lib/api/suppliers";
import {
  DashboardData,
  DashboardStats,
  Receivable,
  Payable,
} from "@/lib/api/dashboard";
import { getCompletedPurchases, PurchaseInvoice } from "@/lib/api/purchases";

class DashboardService {
  async fetchDashboardData(
    dateRange?: "today" | "week" | "month" | "year",
  ): Promise<DashboardData> {
    try {
      // Fetch all required data in parallel
      const [
        billingsRes,
        purchasesRes,
        productsRes,
        customersRes,
        suppliersRes,
      ] = await Promise.all([
        getCompletedBillings(),
        getCompletedPurchases(),
        getProducts("All"),
        getCustomers(),
        getSuppliers(),
      ]);

      const billings = billingsRes.data || [];
      const purchases = purchasesRes.data || [];
      const products = productsRes.data || [];
      const customers = customersRes.data || [];
      const suppliers = suppliersRes.data || [];

      // Calculate stats directly from API data
      const stats = this.calculateStats(
        billings,
        purchases,
        products,
        customers,
        suppliers,
      );

      // Transform API data to dashboard format
      const receivables = this.transformToReceivables(billings);
      const payables = this.transformToPayables(purchases);

      return {
        stats,
        receivables,
        payables,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  private calculateStats(
    billings: Billing[],
    purchases: PurchaseInvoice[],
    products: Product[],
    customers: Customer[],
    suppliers: Supplier[],
  ): DashboardStats {
    // Sales - Direct from API
    const totalSales = billings.reduce(
      (sum, b) => sum + (b.grandTotal || 0),
      0,
    );
    const totalInvoices = billings.length;
    const soldQty = billings.reduce(
      (sum, b) =>
        sum + b.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );
    const totalCustomers = customers.length;

    // Purchase - Direct from API
    const totalPurchase = purchases.reduce(
      (sum, p) => sum + (p.grandTotal || 0),
      0,
    );
    const totalBills = purchases.length;
    const purchaseQty = purchases.reduce(
      (sum, p) =>
        sum + p.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );
    const totalSuppliers = suppliers.length;

    // Inventory - Direct from API
    const totalProducts = products.length;
    const stockQty = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const stockValue = products.reduce(
      (sum, p) => sum + (p.quantity || 0) * (p.purchasePrice || 0),
      0,
    );

    // Profit - Direct from API
    const totalCost = purchases.reduce(
      (sum, p) =>
        sum +
        p.items.reduce((itemSum, item) => itemSum + (item.totalAmount || 0), 0),
      0,
    );
    const grossProfit = totalSales - totalCost;
    const avgProfitMarginPercent =
      totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
    const avgCartValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

    return {
      totalSales,
      totalInvoices,
      soldQty,
      totalCustomers,
      toReceive: 0, // Will be calculated from receivables
      totalPurchase,
      totalBills,
      purchaseQty,
      totalSuppliers,
      toPay: 0, // Will be calculated from payables
      totalPaid: totalSales,
      totalExpense: totalPurchase,
      totalProducts,
      stockQty,
      stockValue,
      grossProfit,
      avgProfitMargin: grossProfit,
      avgProfitMarginPercent,
      avgCartValue,
      avgBills: totalBills > 0 ? totalPurchase / totalBills : 0,
    };
  }

  private transformToReceivables(billings: Billing[]): Receivable[] {
    // Simply transform what the API returns
    return billings.map((billing) => ({
      id: billing._id,
      customerName: billing.customerId?.name || "Unknown",
      invoiceNo: billing.invoiceNumber,
      invoiceDate: billing.createdAt.split("T")[0],
      dueDate: this.calculateDueDate(billing.createdAt),
      amount: billing.grandTotal,
      paidAmount: billing.paymentMode ? billing.grandTotal : 0,
      pendingAmount: billing.paymentMode ? 0 : billing.grandTotal,
      status: billing.paymentMode ? "paid" : "pending",
    }));
  }

  private transformToPayables(purchases: PurchaseInvoice[]): Payable[] {
    // Simply transform what the API returns
    return purchases.map((purchase) => ({
      id: purchase._id,
      supplierName: purchase.supplierId?.name || "Unknown",
      billNo: purchase.invoiceNumber,
      billDate: (purchase.invoiceDate || purchase.createdAt).split("T")[0],
      dueDate: this.calculateDueDate(
        purchase.invoiceDate || purchase.createdAt,
      ),
      amount: purchase.grandTotal,
      paidAmount: purchase.status === "Completed" ? purchase.grandTotal : 0,
      pendingAmount: purchase.status === "Completed" ? 0 : purchase.grandTotal,
      status: purchase.status === "Completed" ? "paid" : "pending",
    }));
  }

  private calculateDueDate(date: string): string {
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString().split("T")[0];
  }
}

export const dashboardService = new DashboardService();
