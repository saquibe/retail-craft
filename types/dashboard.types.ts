export interface DashboardStats {
  // Section 1 - Sales
  totalSales: number;
  totalInvoices: number;
  soldQty: number;
  totalCustomers: number;
  toReceive: number;

  // Section 2 - Purchase
  totalPurchase: number;
  totalBills: number;
  purchaseQty: number;
  totalSuppliers: number;
  toPay: number;

  // Section 3 - Inventory
  totalPaid: number;
  totalExpense: number;
  totalProducts: number;
  stockQty: number;
  stockValue: number;

  // Section 4 - Profit & Analytics
  grossProfit: number;
  avgProfitMargin: number;
  avgProfitMarginPercent: number;
  avgCartValue: number;
  avgBills: number;
}

export interface ReceivableItem {
  id: string;
  customerName: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "pending" | "partial" | "overdue";
}

export interface PayableItem {
  id: string;
  supplierName: string;
  billNo: string;
  billDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "pending" | "partial" | "overdue";
}

export interface DashboardData {
  stats: DashboardStats;
  receivables: ReceivableItem[];
  payables: PayableItem[];
}
