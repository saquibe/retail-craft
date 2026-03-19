"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Loader2,
  Eye,
  FileText,
  Calendar,
  User,
  CreditCard,
  Package,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from "lucide-react";
import { getCompletedBillings, Billing } from "@/lib/api/billing";
import { ThermalInvoice } from "./ThermalInvoice";
import toast from "react-hot-toast";

interface CompletedBillingsProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function CompletedBillings({
  isOpen = false,
  onToggle,
}: CompletedBillingsProps) {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [filteredBillings, setFilteredBillings] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [expandedBilling, setExpandedBilling] = useState<string | null>(null);

  // Load completed billings when opened
  useEffect(() => {
    if (isOpen) {
      loadCompletedBillings();
    }
  }, [isOpen]);

  // Filter billings based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBillings(billings);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = billings.filter(
      (billing) =>
        billing.invoiceNumber.toLowerCase().includes(searchLower) ||
        billing.customerId?.name?.toLowerCase().includes(searchLower) ||
        billing.customerId?.email?.toLowerCase().includes(searchLower) ||
        billing.customerId?.mobile?.includes(searchLower) ||
        billing.paymentMode?.toLowerCase().includes(searchLower) ||
        // Search in items
        billing.items?.some(
          (item) =>
            item.productName.toLowerCase().includes(searchLower) ||
            item.barCode.toLowerCase().includes(searchLower),
        ),
    );
    setFilteredBillings(filtered);
  }, [searchTerm, billings]);

  const loadCompletedBillings = async () => {
    setIsLoading(true);
    try {
      const response = await getCompletedBillings();
      if (response.success && response.data) {
        setBillings(response.data);
        setFilteredBillings(response.data);
      }
    } catch (error) {
      console.error("Error loading completed billings:", error);
      toast.error("Failed to load completed billings");
    } finally {
      setIsLoading(false);
    }
  };

  // Get payment mode badge color
  const getPaymentModeBadge = (mode: string) => {
    switch (mode) {
      case "Cash":
        return "bg-green-100 text-green-800";
      case "UPI":
        return "bg-blue-100 text-blue-800";
      case "Debit/Credit Card":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewInvoice = (billing: Billing) => {
    setSelectedBilling(billing);
    setShowInvoiceDialog(true);
  };

  const toggleExpand = (billingId: string) => {
    setExpandedBilling(expandedBilling === billingId ? null : billingId);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Completed Billings
            {billings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {billings.length}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by invoice, customer, items, payment mode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadCompletedBillings} size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Billings Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : filteredBillings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg mb-2">No completed billings found</p>
              <p className="text-sm">
                {searchTerm
                  ? "Try a different search term"
                  : "Complete a billing to see it here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBillings.slice(0, 5).map((billing) => (
                    <>
                      <TableRow
                        key={billing._id}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleExpand(billing._id)}
                          >
                            {expandedBilling === billing._id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {billing.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {format(new Date(billing.createdAt), "dd/MM/yyyy")}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(billing.createdAt), "hh:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            {billing.customerId?.name || "N/A"}
                          </div>
                          {billing.customerId?.customerType && (
                            <Badge
                              className={
                                billing.customerId.customerType === "B2B"
                                  ? "bg-purple-100 text-purple-800 text-xs mt-1"
                                  : "bg-green-100 text-green-800 text-xs mt-1"
                              }
                            >
                              {billing.customerId.customerType}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-gray-400" />
                            {billing.items?.length || 0} items
                          </div>
                          <div className="text-xs text-gray-500">
                            Total Qty:{" "}
                            {billing.items?.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            ) || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-indigo-600">
                          {formatCurrency(billing.grandTotal)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPaymentModeBadge(
                              billing.paymentMode || "",
                            )}
                          >
                            {/* <CreditCard className="w-3 h-3 mr-1" /> */}
                            {billing.paymentMode || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(billing)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedBilling === billing._id && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-medium flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Items Details
                              </h4>
                              <div className="grid gap-2">
                                {billing.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center text-sm p-2 bg-white rounded border"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {item.productName}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Code: {item.barCode}
                                      </p>
                                    </div>
                                    <div className="flex gap-4">
                                      <div className="text-right">
                                        <span className="text-gray-500 text-xs">
                                          Qty:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {item.quantity}
                                        </span>
                                      </div>
                                      <div className="text-right min-w-[80px]">
                                        <span className="text-gray-500 text-xs">
                                          Price:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          ₹{item.price.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="text-right min-w-[80px]">
                                        <span className="text-gray-500 text-xs">
                                          Total:
                                        </span>
                                        <span className="ml-1 font-medium text-indigo-600">
                                          ₹
                                          {(item.price * item.quantity).toFixed(
                                            2,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
              {billings.length > 5 && (
                <div className="text-center mt-4">
                  <Badge variant="outline" className="text-xs">
                    Showing 5 of {billings.length} billings
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}

      {/* View Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice {selectedBilling?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedBilling && (
            <ThermalInvoice
              billing={selectedBilling}
              onPrinted={() => setShowInvoiceDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
