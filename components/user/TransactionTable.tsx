"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowUpDown,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Transaction {
  id: string;
  customerName?: string;
  supplierName?: string;
  invoiceNo?: string;
  billNo?: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "pending" | "partial" | "overdue";
}

interface TransactionTableProps {
  type: "receivable" | "payable";
  data: Transaction[];
  onViewDetails: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function TransactionTable({
  type,
  data,
  onViewDetails,
  onDownload,
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Transaction>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 5;

  const title = type === "receivable" ? "Total Receivable" : "Total Payable";
  const nameField = type === "receivable" ? "customerName" : "supplierName";
  const documentField = type === "receivable" ? "invoiceNo" : "billNo";

  // Filter data
  const filteredData = data.filter(
    (item) =>
      item[nameField]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item[documentField]?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * direction;
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * direction;
    }
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      partial: "bg-blue-100 text-blue-800",
      overdue: "bg-red-100 text-red-800",
    };
    return (
      variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const toggleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const totalPending = filteredData.reduce(
    (sum, item) => sum + item.pendingAmount,
    0,
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with summary */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">
            Total Pending: {formatCurrency(totalPending)}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${
              type === "receivable" ? "customer" : "supplier"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">
              <Button variant="ghost" onClick={() => toggleSort(nameField)}>
                {type === "receivable" ? "Customer" : "Supplier"}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort(documentField)}>
                {type === "receivable" ? "Invoice No" : "Bill No"}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => toggleSort("amount")}>
                Amount
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Pending</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item[nameField]}</TableCell>
              <TableCell>{item[documentField]}</TableCell>
              <TableCell>{formatDate(item.invoiceDate)}</TableCell>
              <TableCell>{formatDate(item.dueDate)}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.amount)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.paidAmount)}
              </TableCell>
              <TableCell className="text-right font-medium">
                <span
                  className={
                    item.pendingAmount > 0 ? "text-red-600" : "text-green-600"
                  }
                >
                  {formatCurrency(item.pendingAmount)}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadge(item.status)}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(item.id)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onDownload && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownload(item.id)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
