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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Loader2,
  Eye,
  FileText,
  Calendar,
  Building2,
  Package,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MessageSquare,
  Plus,
} from "lucide-react";
import {
  getCompletedPurchases,
  PurchaseInvoice,
  updatePurchasePaymentStatus,
} from "@/lib/api/purchases";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import React from "react";
import { PurchaseInvoicePrint } from "@/components/purchases/PurchaseInvoicePrint";

export default function SupplierInvoicesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseInvoice[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseInvoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);

  // Confirmation dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPurchaseId, setPendingPurchaseId] = useState<string | null>(
    null,
  );
  const [pendingPurchaseStatus, setPendingPurchaseStatus] =
    useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load completed purchases on mount
  useEffect(() => {
    loadCompletedPurchases();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter purchases based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPurchases(purchases);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = purchases.filter(
      (purchase) =>
        purchase.invoiceNumber.toLowerCase().includes(searchLower) ||
        purchase.referenceInvoiceNumber?.toLowerCase().includes(searchLower) ||
        purchase.supplierId?.name?.toLowerCase().includes(searchLower) ||
        purchase.supplierId?.email?.toLowerCase().includes(searchLower) ||
        purchase.supplierId?.mobile?.includes(searchLower) ||
        purchase.paymentMode?.toLowerCase().includes(searchLower) ||
        purchase.paymentStatus?.toLowerCase().includes(searchLower) ||
        purchase.items?.some(
          (item) =>
            item.productName.toLowerCase().includes(searchLower) ||
            item.barCode.toLowerCase().includes(searchLower),
        ),
    );
    setFilteredPurchases(filtered);
  }, [searchTerm, purchases]);

  const loadCompletedPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await getCompletedPurchases();
      if (response.success && response.data) {
        setPurchases(response.data);
        setFilteredPurchases(response.data);
      }
    } catch (error) {
      console.error("Error loading completed purchases:", error);
      toast.error("Failed to load completed purchase invoices");
    } finally {
      setIsLoading(false);
    }
  };

  // Open confirmation dialog before updating payment status
  const openConfirmDialog = (purchaseId: string, currentStatus: string) => {
    setPendingPurchaseId(purchaseId);
    setPendingPurchaseStatus(currentStatus);
    setShowConfirmDialog(true);
  };

  // Handle payment status update after confirmation
  const handleUpdatePaymentStatus = async () => {
    if (!pendingPurchaseId) return;

    const newStatus = pendingPurchaseStatus === "Paid" ? "Pending" : "Paid";
    setUpdatingPayment(pendingPurchaseId);
    setShowConfirmDialog(false);

    try {
      const response = await updatePurchasePaymentStatus(
        pendingPurchaseId,
        newStatus,
      );
      if (response.success) {
        toast.success(`Payment status updated to ${newStatus}`);
        loadCompletedPurchases();
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
      setPendingPurchaseId(null);
      setPendingPurchaseStatus("");
    }
  };

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchases.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  // Get payment mode badge color
  const getPaymentModeBadge = (mode: string) => {
    switch (mode) {
      case "Cash":
        return "bg-green-100 text-green-800";
      case "UPI":
        return "bg-blue-100 text-blue-800";
      case "Debit/Credit Card":
        return "bg-purple-100 text-purple-800";
      case "Pay Later":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get payment status badge color
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
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

  const handleViewInvoice = (purchase: PurchaseInvoice) => {
    setSelectedPurchase(purchase);
    setShowInvoiceDialog(true);
  };

  const toggleExpand = (purchaseId: string) => {
    setExpandedPurchase(expandedPurchase === purchaseId ? null : purchaseId);
  };

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Get the purchase details for confirmation message
  const getPurchaseForConfirmation = () => {
    return purchases.find((p) => p._id === pendingPurchaseId);
  };

  const purchaseToConfirm = getPurchaseForConfirmation();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Supplier Invoices</h1>
          <p className="text-gray-500 mt-1">
            View and manage all completed supplier invoices
          </p>
        </div>
        <Button
          onClick={() => router.push("/user/purchases")}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Purchase
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by invoice, ref. invoice, supplier, items, payment mode, payment status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={loadCompletedPurchases}
              size="sm"
              className="cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 animate-pulse rounded"
                />
              ))}
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg mb-2">
                No completed purchase invoices found
              </p>
              <p className="text-sm">
                {searchTerm
                  ? "Try a different search term"
                  : "Complete a purchase invoice to see it here"}
              </p>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <Table className="min-w-full whitespace-nowrap">
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Ref. Invoice #</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">
                          Final Amount
                        </TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((purchase) => (
                        <React.Fragment key={purchase._id}>
                          <TableRow className="cursor-pointer hover:bg-gray-50">
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleExpand(purchase._id)}
                              >
                                {expandedPurchase === purchase._id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                              {purchase.invoiceNumber}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                {format(
                                  new Date(purchase.invoiceDate),
                                  "dd/MM/yyyy",
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-500">
                              {purchase.referenceInvoiceNumber || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-gray-400" />
                                {purchase.supplierId?.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                GST: {purchase.supplierId?.gstIn}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Package className="w-3 h-3 text-gray-400" />
                                {purchase.items?.length || 0} items
                              </div>
                              <div className="text-xs text-gray-500">
                                Total Qty:{" "}
                                {purchase.items?.reduce(
                                  (sum, item) => sum + item.quantity,
                                  0,
                                ) || 0}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {(() => {
                                const finalTotal =
                                  purchase.finalTotal ||
                                  purchase.grandTotal ||
                                  0;
                                const roundedTotal = Math.round(finalTotal);
                                return formatCurrency(roundedTotal);
                              })()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getPaymentModeBadge(
                                  purchase.paymentMode || "",
                                )}
                              >
                                {purchase.paymentMode === "Pay Later" ? (
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                ) : (
                                  <CreditCard className="w-3 h-3 mr-1" />
                                )}
                                {purchase.paymentMode || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getPaymentStatusBadge(
                                    purchase.paymentStatus || "Pending",
                                  )}
                                >
                                  {purchase.paymentStatus || "Pending"}
                                </Badge>
                                {purchase.paymentMode === "Pay Later" &&
                                  purchase.paymentStatus !== "Paid" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        openConfirmDialog(
                                          purchase._id,
                                          purchase.paymentStatus || "Pending",
                                        )
                                      }
                                      disabled={
                                        updatingPayment === purchase._id
                                      }
                                      className="h-6 text-xs"
                                    >
                                      {updatingPayment === purchase._id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        "Mark Paid"
                                      )}
                                    </Button>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewInvoice(purchase)}
                              >
                                <Eye className="w-4 h-4 mr-1" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedPurchase === purchase._id && (
                            <TableRow>
                              <TableCell
                                colSpan={10}
                                className="bg-gray-50 p-4"
                              >
                                <div className="space-y-3">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Items
                                    Details
                                  </h4>
                                  <div className="grid gap-2">
                                    {purchase.items?.map((item, idx) => {
                                      const priceWithQty =
                                        item.purchasePrice * item.quantity;
                                      const taxAmount =
                                        (priceWithQty * item.taxPercent) / 100;
                                      return (
                                        <div
                                          key={idx}
                                          className="flex justify-between items-center text-sm p-2 bg-white rounded border"
                                        >
                                          <div className="flex-1">
                                            <p className="font-medium">
                                              {item.productName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              Item Code: {item.itemCode}
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
                                                ₹{item.purchasePrice.toFixed(2)}
                                              </span>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                              <span className="text-gray-500 text-xs">
                                                SGST:
                                              </span>
                                              <span className="ml-1 font-medium">
                                                ₹{(taxAmount / 2).toFixed(2)}
                                              </span>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                              <span className="text-gray-500 text-xs">
                                                CGST:
                                              </span>
                                              <span className="ml-1 font-medium">
                                                ₹{(taxAmount / 2).toFixed(2)}
                                              </span>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                              <span className="text-gray-500 text-xs">
                                                Total:
                                              </span>
                                              <span className="ml-1 font-medium text-indigo-600">
                                                ₹
                                                {(
                                                  priceWithQty + taxAmount
                                                ).toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Summary Section with Rounded Total */}
                                  <div className="mt-4 pt-3 border-t">
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          Base Amount:
                                        </span>
                                        <span className="font-medium">
                                          ₹
                                          {purchase.subTotal?.toFixed(2) ||
                                            "0.00"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          SGST:
                                        </span>
                                        <span className="font-medium">
                                          ₹
                                          {(
                                            (purchase.totalTax || 0) / 2
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          CGST:
                                        </span>
                                        <span className="font-medium">
                                          ₹
                                          {(
                                            (purchase.totalTax || 0) / 2
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          Total Tax:
                                        </span>
                                        <span className="font-medium">
                                          ₹
                                          {purchase.totalTax?.toFixed(2) ||
                                            "0.00"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                          Subtotal:
                                        </span>
                                        <span className="font-medium">
                                          ₹
                                          {purchase.grandTotal?.toFixed(2) ||
                                            "0.00"}
                                        </span>
                                      </div>
                                      {purchase.freightCharge &&
                                        purchase.freightCharge > 0 && (
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                              Freight Charge:
                                            </span>
                                            <span className="text-blue-600 font-medium">
                                              +₹
                                              {purchase.freightCharge?.toFixed(
                                                2,
                                              )}
                                            </span>
                                          </div>
                                        )}
                                      {purchase.discount &&
                                        purchase.discount > 0 && (
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                              Discount ({purchase.discount}%):
                                            </span>
                                            <span className="text-red-600 font-medium">
                                              -₹
                                              {purchase.discountAmount?.toFixed(
                                                2,
                                              )}
                                            </span>
                                          </div>
                                        )}

                                      {/* Rounded Total Calculation */}
                                      {(() => {
                                        const finalTotal =
                                          purchase.finalTotal ||
                                          purchase.grandTotal ||
                                          0;
                                        const roundedTotal =
                                          Math.round(finalTotal);
                                        const roundOffAmount =
                                          roundedTotal - finalTotal;

                                        return (
                                          <>
                                            {roundOffAmount !== 0 && (
                                              <div className="flex justify-between text-sm text-gray-500">
                                                <span>Original Amount:</span>
                                                <span className="line-through">
                                                  ₹{finalTotal.toFixed(2)}
                                                </span>
                                              </div>
                                            )}

                                            <div className="flex justify-between text-base font-bold pt-2 mt-2 border-t border-dashed">
                                              <span className="text-gray-800">
                                                Final Amount:
                                              </span>
                                              <span className="text-green-600 text-lg">
                                                ₹{roundedTotal.toFixed(2)}
                                              </span>
                                            </div>

                                            {roundOffAmount !== 0 && (
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">
                                                  Rounded Off:
                                                </span>
                                                <span
                                                  className={
                                                    roundOffAmount > 0
                                                      ? "text-blue-600"
                                                      : "text-red-600"
                                                  }
                                                >
                                                  {roundOffAmount > 0
                                                    ? `+₹${roundOffAmount.toFixed(
                                                        2,
                                                      )}`
                                                    : `-₹${Math.abs(
                                                        roundOffAmount,
                                                      ).toFixed(2)}`}
                                                </span>
                                              </div>
                                            )}
                                          </>
                                        );
                                      })()}

                                      {purchase.paymentMode === "Pay Later" &&
                                        purchase.remarks && (
                                          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="flex items-start gap-2">
                                              <MessageSquare className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                              <div>
                                                <p className="text-xs font-medium text-orange-800">
                                                  Payment Remarks:
                                                </p>
                                                <p className="text-sm text-orange-700">
                                                  {purchase.remarks}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Show</span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">entries</span>
                  </div>

                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredPurchases.length)} of{" "}
                    {filteredPurchases.length} entries
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className="w-8 h-8"
                            >
                              {pageNum}
                            </Button>
                          );
                        },
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Purchase Invoice {selectedPurchase?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <PurchaseInvoicePrint
              purchase={selectedPurchase}
              onPrint={() => setShowInvoiceDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Mark Paid */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark invoice{" "}
              <span className="font-semibold">
                {purchaseToConfirm?.invoiceNumber}
              </span>{" "}
              as <span className="font-semibold text-green-600">Paid</span>.
              <br />
              <br />
              Supplier:{" "}
              <span className="font-semibold">
                {purchaseToConfirm?.supplierId?.name}
              </span>
              <br />
              Amount:{" "}
              <span className="font-semibold">
                {(() => {
                  const finalTotal =
                    purchaseToConfirm?.finalTotal ||
                    purchaseToConfirm?.grandTotal ||
                    0;
                  const roundedTotal = Math.round(finalTotal);
                  return formatCurrency(roundedTotal);
                })()}
              </span>
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingPurchaseId(null);
                setPendingPurchaseStatus("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdatePaymentStatus}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes, Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
