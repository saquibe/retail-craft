"use client";

import { useState, useRef, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  Loader2,
  X,
  Check,
  AlertCircle,
  Building2,
  RefreshCw,
  Truck,
  UserPlus,
  Calendar,
  MapPin,
  Repeat,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSuppliers, Supplier } from "@/lib/api/suppliers";
import { createSupplier, SupplierFormData } from "@/lib/api/suppliers";
import { usePurchaseStore } from "@/lib/hooks/usePurchaseStore";
import CreateProductDialog from "@/components/purchases/CreateProductDialog";
import SupplierForm from "@/components/forms/SupplierForm";
import { CompletedPurchases } from "@/components/purchases/CompletedPurchases";
import { getProducts, Product } from "@/lib/api/products";

export default function PurchasesPage() {
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const hasFocusedRef = useRef(false);

  const {
    selectedSupplier,
    items,
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    reverseCharge,
    purchaseId,
    isLoaded,
    isLoading,
    totals,
    setSelectedSupplier,
    setInvoiceNumber,
    setInvoiceDate,
    setPlaceOfSupply,
    setReverseCharge,
    scanBarcode,
    updateQuantity,
    removeProduct,
    completePurchaseInvoice,
    clearSession,
  } = usePurchaseStore();

  // Local state
  const [supplierSearch, setSupplierSearch] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierResults, setShowSupplierResults] = useState(false);
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [showCompletedPurchases, setShowCompletedPurchases] = useState(false);
  const [products, setProducts] = useState<Product[]>([]); // ADD THIS LINE
  const [isScanning, setIsScanning] = useState(false); // ADD THIS LINE for barcode scanning loading

  // Load suppliers on mount
  useEffect(() => {
    loadSuppliers();
    loadProducts(); // ADD THIS LINE
  }, []);

  const loadProducts = async () => {
    try {
      // IMPORTANT: Pass "All" to get all products including those with zero quantity
      const response = await getProducts("All");
      if (response.success && response.data) {
        setProducts(response.data);
        console.log("Products loaded:", response.data.length); // Add this to verify
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
  };

  // Focus barcode input when all supplier details are filled (only once)
  useEffect(() => {
    if (
      selectedSupplier &&
      invoiceNumber &&
      invoiceDate &&
      placeOfSupply &&
      reverseCharge &&
      isLoaded &&
      !hasFocusedRef.current
    ) {
      hasFocusedRef.current = true;
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }

    // Reset the focus flag when supplier changes
    if (!selectedSupplier) {
      hasFocusedRef.current = false;
    }
  }, [
    selectedSupplier,
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    reverseCharge,
    isLoaded,
  ]);

  const loadSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const response = await getSuppliers();
      if (response.success && response.data) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!supplierSearch.trim()) return false;

    const searchLower = supplierSearch.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.email?.toLowerCase().includes(searchLower) ||
      supplier.mobile?.includes(supplierSearch) ||
      supplier.gstIn?.toLowerCase().includes(searchLower) ||
      supplier.city.toLowerCase().includes(searchLower)
    );
  });

  // Handle supplier selection
  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSupplierSearch("");
    setShowSupplierResults(false);
  };

  // Handle create new supplier
  const handleCreateSupplier = async (data: SupplierFormData) => {
    try {
      const response = await createSupplier(data);
      if (response.success) {
        toast.success("Supplier created successfully!");
        setShowNewSupplierDialog(false);
        await loadSuppliers();

        // Auto-select the newly created supplier
        if (response.data) {
          setSelectedSupplier(response.data);
        }
      }
    } catch (error: any) {
      console.error("Create supplier error:", error);
      toast.error(error.response?.data?.message || "Failed to create supplier");
    }
  };

  // Handle barcode scan
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplier) {
      toast.error("Please select a supplier first");
      return;
    }

    if (!invoiceNumber.trim()) {
      toast.error("Please enter invoice number");
      return;
    }

    if (!invoiceDate) {
      toast.error("Please select invoice date");
      return;
    }

    if (!placeOfSupply.trim()) {
      toast.error("Please enter place of supply");
      return;
    }

    if (!reverseCharge) {
      toast.error("Please select reverse charge");
      return;
    }

    if (!barcode.trim()) return;

    // Log the barcode being scanned
    console.log("1. Scanning barcode:", barcode);

    // Log all available barcodes in your products array
    console.log(
      "2. Available barcodes:",
      products.map((p) => p.barCode),
    );

    // Check if product exists in local state
    const productExists = products.some((p) => p.barCode === barcode);
    console.log("3. Product exists in local state?", productExists);

    setIsScanning(true); // Use the new state

    try {
      const success = await scanBarcode(barcode, quantity);
      console.log("4. scanBarcode returned:", success);

      if (success) {
        // Product was successfully added
        console.log("5. Product added successfully");
        setBarcode("");
        setQuantity(1);
      } else {
        // scanBarcode returned false
        console.log("5. scanBarcode returned false");

        if (!productExists) {
          // Product doesn't exist at all - show create dialog
          console.log("6. Product doesn't exist - opening create dialog");
          setScannedBarcode(barcode);
          setShowCreateProductDialog(true);
          setBarcode(""); // Clear barcode after opening dialog
        } else {
          // Product exists but couldn't be added (stock issue, etc.)
          console.log("6. Product exists but couldn't be added");
          setBarcode("");
        }
      }
    } catch (error) {
      console.error("Error in handleBarcodeScan:", error);
      setBarcode("");
    } finally {
      setIsScanning(false); // Use the new state
    }
  };

  // Handle complete purchase
  const handleCompletePurchase = async () => {
    if (items.length === 0) {
      toast.error("No items in purchase invoice");
      return;
    }

    const success = await completePurchaseInvoice();
    if (success) {
      setBarcode("");
      setQuantity(1);
    }
  };

  // Handle new purchase
  const handleNewPurchase = async () => {
    if (items.length > 0) {
      if (
        !window.confirm(
          "Clear current purchase session? This will delete the draft.",
        )
      ) {
        return;
      }
    }
    await clearSession();
    setBarcode("");
    setQuantity(1);
    setSupplierSearch("");
    hasFocusedRef.current = false;
    toast.success("New purchase session started");
  };

  // Show loading while restoring session
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Restoring your session...</p>
        </div>
      </div>
    );
  }

  // Check if all required fields are filled
  const allDetailsFilled =
    selectedSupplier &&
    invoiceNumber &&
    invoiceDate &&
    placeOfSupply &&
    reverseCharge;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Reset Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Purchase Invoice</h1>
          <p className="text-gray-500">Receive stock from suppliers</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {format(new Date(), "dd MMM yyyy, hh:mm a")}
          </Badge>
          {(selectedSupplier || items.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewPurchase}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Purchase
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Supplier & Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Selection Card */}
          <Card
            className={`border-2 ${
              !selectedSupplier ? "border-red-200 bg-red-50/50" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Supplier Details
                  {!selectedSupplier && (
                    <Badge variant="destructive" className="ml-2">
                      Required
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supplier Search */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search supplier by name, email, phone, GST..."
                    value={supplierSearch}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setShowSupplierResults(true);
                    }}
                    onFocus={() => setShowSupplierResults(true)}
                    className="pl-10"
                    disabled={!!selectedSupplier}
                  />

                  {/* Search Results Dropdown */}
                  {showSupplierResults &&
                    supplierSearch.trim() !== "" &&
                    !selectedSupplier && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                        {isLoadingSuppliers ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                          </div>
                        ) : filteredSuppliers.length > 0 ? (
                          <>
                            {filteredSuppliers.map((supplier) => (
                              <div
                                key={supplier._id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSelectSupplier(supplier)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <span className="font-medium">
                                        {supplier.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {supplier.email && (
                                    <span>{supplier.email} • </span>
                                  )}
                                  {supplier.mobile && (
                                    <span>{supplier.mobile}</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  GST: {supplier.gstIn} • {supplier.city},{" "}
                                  {supplier.state}
                                </div>
                              </div>
                            ))}
                            {/* Create New Supplier Option */}
                            <div
                              className="p-3 hover:bg-indigo-50 cursor-pointer border-t-2 border-indigo-200 bg-indigo-50/50"
                              onClick={() => {
                                setShowSupplierResults(false);
                                setShowNewSupplierDialog(true);
                              }}
                            >
                              <div className="flex items-center gap-2 text-indigo-600">
                                <UserPlus className="w-4 h-4" />
                                <span className="font-medium">
                                  Create new supplier "{supplierSearch}"
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-gray-500 mb-2">
                              No suppliers found matching "{supplierSearch}"
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowSupplierResults(false);
                                setShowNewSupplierDialog(true);
                              }}
                              className="text-indigo-600 border-indigo-200"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Create New Supplier
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Selected Supplier Display */}
              {selectedSupplier && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">
                          {selectedSupplier.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedSupplier.email} • {selectedSupplier.mobile}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          GST: {selectedSupplier.gstIn}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedSupplier.address}, {selectedSupplier.city},{" "}
                          {selectedSupplier.state}, {selectedSupplier.country} -{" "}
                          {selectedSupplier.pincode}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Changing supplier will delete the current draft. Continue?",
                          )
                        ) {
                          await setSelectedSupplier(null);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Change
                    </Button>
                  </div>
                </div>
              )}

              {/* Invoice Number Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span>Invoice Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter supplier invoice number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  disabled={!selectedSupplier || !!purchaseId}
                  className={!selectedSupplier ? "bg-gray-50" : ""}
                />
              </div>

              {/* Invoice Date Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Invoice Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  disabled={!selectedSupplier || !!purchaseId}
                  className={!selectedSupplier ? "bg-gray-50" : ""}
                />
              </div>

              {/* Place of Supply Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Place of Supply</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter place of supply (e.g., State name)"
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  disabled={!selectedSupplier || !!purchaseId}
                  className={!selectedSupplier ? "bg-gray-50" : ""}
                />
              </div>

              {/* Reverse Charge Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Repeat className="w-4 h-4 text-gray-400" />
                  <span>Reverse Charge</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 p-2 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reverseCharge"
                      value="Yes"
                      checked={reverseCharge === "Yes"}
                      onChange={(e) => setReverseCharge(e.target.value)}
                      disabled={!selectedSupplier || !!purchaseId}
                      className="w-4 h-4 text-indigo-600 cursor-pointer"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reverseCharge"
                      value="No"
                      checked={reverseCharge === "No"}
                      onChange={(e) => setReverseCharge(e.target.value)}
                      disabled={!selectedSupplier || !!purchaseId}
                      className="w-4 h-4 text-indigo-600 cursor-pointer"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              {/* Required Message */}
              {(!selectedSupplier ||
                !invoiceNumber ||
                !invoiceDate ||
                !placeOfSupply ||
                !reverseCharge) && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">
                    {!selectedSupplier
                      ? "Please select a supplier to start"
                      : !invoiceNumber
                      ? "Please enter invoice number"
                      : !invoiceDate
                      ? "Please select invoice date"
                      : !placeOfSupply
                      ? "Please enter place of supply"
                      : "Please select reverse charge"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Barcode Scanner Card */}
          <Card className={`${!allDetailsFilled ? "opacity-50" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Barcode className="w-5 h-5" />
                Scan Product Barcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeScan} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      ref={barcodeInputRef}
                      type="text"
                      placeholder={
                        allDetailsFilled
                          ? "Scan or enter barcode..."
                          : "Complete all supplier details first"
                      }
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="pl-10"
                      disabled={!allDetailsFilled || isLoading || isScanning}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      placeholder="Qty"
                      disabled={!allDetailsFilled || isLoading || isScanning}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!allDetailsFilled || isLoading || isScanning}
                    variant={allDetailsFilled ? "default" : "outline"}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  If product not found, you'll be prompted to create it
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Items Table Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Received Items</CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Total Qty:{" "}
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                  {/* {items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Clear all items?")) {
                          items.forEach((item) =>
                            removeProduct(item.productId),
                          );
                        }
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )} */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No items added</p>
                  <p className="text-sm">
                    {allDetailsFilled
                      ? "Scan barcode to add products"
                      : "Complete all supplier details first"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Barcode</TableHead>
                        <TableHead className="text-right">
                          Purchase Price
                        </TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Tax %</TableHead>
                        <TableHead className="text-right">Tax Amt</TableHead>
                        <TableHead className="text-right">Base Amt</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right w-[100px]">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        // Calculate based on backend formula
                        const priceWithQty = item.purchasePrice * item.quantity;
                        const taxAmount =
                          (priceWithQty * item.taxPercent) /
                          (100 + item.taxPercent);
                        const baseAmount = priceWithQty - taxAmount;

                        return (
                          <TableRow key={item.productId}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {item.productName}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {item.barCode}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{item.purchasePrice.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    )
                                  }
                                  disabled={isLoading}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity + 1,
                                    )
                                  }
                                  disabled={isLoading}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {item.taxPercent}%
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{taxAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{baseAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{priceWithQty.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => {
                                  console.log(
                                    "Remove button clicked for product:",
                                    item.productId,
                                  );
                                  console.log("Product details:", item);
                                  removeProduct(item.productId);
                                }}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invoice Info */}
              {/* {purchaseId && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">
                    Invoice ID
                  </p>
                  <p className="text-sm font-mono break-all">{purchaseId}</p>
                </div>
              )} */}

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Amount:</span>
                  <span className="font-medium">
                    ₹{totals.subTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Tax:</span>
                  <span className="font-medium">
                    ₹{totals.totalTax.toFixed(2)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">
                    ₹{totals.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button
                  className="w-full cursor-pointer"
                  size="lg"
                  onClick={handleCompletePurchase}
                  disabled={
                    !selectedSupplier ||
                    !invoiceNumber ||
                    !invoiceDate ||
                    !placeOfSupply ||
                    !reverseCharge ||
                    items.length === 0 ||
                    isLoading
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>
              </div>

              {/* Items Count */}
              <div className="text-center text-sm text-gray-500 pt-2">
                Total Items: {items.length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completed Purchases Section */}
      <CompletedPurchases
        isOpen={showCompletedPurchases}
        onToggle={() => setShowCompletedPurchases(!showCompletedPurchases)}
      />

      {/* New Supplier Dialog */}
      <Dialog
        open={showNewSupplierDialog}
        onOpenChange={setShowNewSupplierDialog}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm
            initialData={supplierSearch ? { name: supplierSearch } : undefined}
            onSubmit={handleCreateSupplier}
            isLoading={isLoadingSuppliers}
            onCancel={() => setShowNewSupplierDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <CreateProductDialog
        open={showCreateProductDialog}
        onOpenChange={setShowCreateProductDialog}
        barcode={scannedBarcode}
        onProductCreated={() => {
          // Retry scanning the barcode after product is created
          setTimeout(() => {
            scanBarcode(scannedBarcode, quantity);
          }, 500);
        }}
      />
    </div>
  );
}
