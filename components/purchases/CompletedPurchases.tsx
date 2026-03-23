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
  Truck,
  MapPin,
  Repeat,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getCompletedPurchases, PurchaseInvoice } from "@/lib/api/purchases";
import { PurchaseInvoicePrint } from "./PurchaseInvoicePrint";
import toast from "react-hot-toast";

interface CompletedPurchasesProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function CompletedPurchases({
  isOpen = false,
  onToggle,
}: CompletedPurchasesProps) {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseInvoice[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseInvoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load completed purchases when opened
  useEffect(() => {
    if (isOpen) {
      loadCompletedPurchases();
    }
  }, [isOpen]);

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
        purchase.supplierId?.name?.toLowerCase().includes(searchLower) ||
        purchase.supplierId?.email?.toLowerCase().includes(searchLower) ||
        purchase.supplierId?.mobile?.includes(searchLower) ||
        purchase.placeOfSupply?.toLowerCase().includes(searchLower) ||
        purchase.reverseCharge?.toLowerCase().includes(searchLower) ||
        // Search in items
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

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchases.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

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

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Completed Purchase Invoices
            {purchases.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {purchases.length}
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
                placeholder="Search by invoice, supplier, items, place of supply..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={loadCompletedPurchases}
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Purchases Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Place of Supply</TableHead>
                      <TableHead>Reverse Charge</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((purchase) => (
                      <>
                        <TableRow
                          key={purchase._id}
                          className="cursor-pointer hover:bg-gray-50"
                        >
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
                          <TableCell className="text-right font-medium text-indigo-600">
                            {formatCurrency(purchase.grandTotal)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {purchase.placeOfSupply}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                purchase.reverseCharge === "Yes"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              <Repeat className="w-3 h-3 mr-1" />
                              {purchase.reverseCharge}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(purchase)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedPurchase === purchase._id && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-gray-50 p-4">
                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  Items Details
                                </h4>
                                <div className="grid gap-2">
                                  {purchase.items?.map((item, idx) => {
                                    const priceWithQty =
                                      item.purchasePrice * item.quantity;
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
                                            Barcode: {item.barCode}
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
                                              Tax:
                                            </span>
                                            <span className="ml-1 font-medium">
                                              ₹{item.taxAmount.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="text-right min-w-[80px]">
                                            <span className="text-gray-500 text-xs">
                                              Total:
                                            </span>
                                            <span className="ml-1 font-medium text-indigo-600">
                                              ₹{priceWithQty.toFixed(2)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
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
                      <ChevronLeft className="h-4 w-4" />
                      Previous
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
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}

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
    </Card>
  );
}
