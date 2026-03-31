// lib/api/dashboard.ts
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

export interface Receivable {
  id: string;
  customerName: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "pending" | "paid";
}

export interface Payable {
  id: string;
  supplierName: string;
  billNo: string;
  billDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "pending" | "paid";
}

export interface DashboardData {
  stats: DashboardStats;
  receivables: Receivable[];
  payables: Payable[];
}
