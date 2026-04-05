//app/(dashboard)/user/billing/page.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/lib/context/AuthContext";
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
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  Package,
  Loader2,
  X,
  Check,
  AlertCircle,
  User,
  Building2,
  Lock,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { getProducts, Product, searchProducts } from "@/lib/api/products";
import {
  getCustomers,
  createCustomer,
  Customer,
  CustomerFormData,
} from "@/lib/api/customers";
import CustomerForm from "@/components/forms/CustomerForm";
import { useBillingStore } from "@/lib/hooks/useBillingStore";
import {
  addProductToBilling,
  completeBilling,
  getBillingById,
} from "@/lib/api/billing";
import { ThermalInvoice } from "@/components/billing/ThermalInvoice";
import BillingPageSkeleton from "@/components/skeletons/BillingPageSkeleton";

interface BillingItem extends Product {
  cartQuantity: number;
}

export default function BillingPage() {
  const { user } = useAuth();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const {
    selectedCustomer,
    cart,
    discount,
    paidAmount,
    isLoaded,
    billingId,
    setSelectedCustomer,
    setDiscount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearSession,
    generateInvoice,
  } = useBillingStore();

  // Local state (non-persistent)
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("");
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [multipleProducts, setMultipleProducts] = useState<any[]>([]);
  const [showProductSelectionDialog, setShowProductSelectionDialog] =
    useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [freightCharge, setFreightCharge] = useState(0);
  const [payLaterRemarks, setPayLaterRemarks] = useState("");
  const [showRemarksInput, setShowRemarksInput] = useState(false);

  // Load products and customers on mount
  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  // Focus barcode input when customer is selected
  useEffect(() => {
    if (selectedCustomer && isLoaded) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [selectedCustomer, isLoaded]);

  const loadProducts = async () => {
    try {
      const response = await getProducts("All");
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
  };

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await getCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    if (!customerSearch.trim()) return false;

    const searchLower = customerSearch.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.mobile?.includes(customerSearch) ||
      (customer.customerType === "B2B" &&
        (customer.companyName?.toLowerCase().includes(searchLower) ||
          customer.gstIn?.toLowerCase().includes(searchLower) ||
          customer.contactName?.toLowerCase().includes(searchLower)))
    );
  });

  // Get customer type badge color
  const getTypeBadge = (type: string) => {
    return type === "B2B"
      ? "bg-purple-100 text-purple-800"
      : "bg-green-100 text-green-800";
  };

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setShowCustomerResults(false);
  };

  // Add product from selection dialog
  const handleAddSelectedProduct = async (product: any) => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }

    if (!billingId) {
      toast.error("Billing session not initialized");
      return;
    }

    setLoading(true);

    try {
      const fullProduct = products.find((p) => p._id === product._id);
      if (fullProduct) {
        const success = await addToCart(fullProduct, product._id);
        if (success) {
          setShowProductSelectionDialog(false);
          setMultipleProducts([]);
          setProductSearch("");
        }
      }
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // Handle barcode scan (combined input)
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }

    if (!billingId) {
      toast.error("Billing session not initialized");
      return;
    }

    const cleanInput = productSearch.trim();

    if (!cleanInput) return;

    setLoading(true);

    try {
      const result = await addToCart({ barCode: cleanInput } as Product);
      if (result) {
        setProductSearch("");
      }
    } catch (error: any) {
      if (error.multiple && error.data && Array.isArray(error.data)) {
        setMultipleProducts(error.data);
        setSelectedBarcode(cleanInput);
        setShowProductSelectionDialog(true);
        setProductSearch("");
      } else {
        toast.error(error?.message || "Failed to add product");
        setProductSearch("");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search result click
  const handleSearchResultClick = async (product: Product) => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }

    if (!billingId) {
      toast.error("Billing session not initialized");
      return;
    }

    setLoading(true);

    try {
      const result = await addToCart(product);
      if (result) {
        setProductSearch("");
        setShowSearchResults(false);
      }
    } catch (error: any) {
      if (error.multiple && error.data && Array.isArray(error.data)) {
        setMultipleProducts(error.data);
        setSelectedBarcode(product.barCode);
        setShowProductSelectionDialog(true);
        setProductSearch("");
        setShowSearchResults(false);
      } else {
        toast.error(error?.message || "Failed to add product");
        setProductSearch("");
        setShowSearchResults(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Search products by name or barcode
  const handleProductSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchProducts(searchTerm);
      if (response.success && response.data) {
        setSearchResults(response.data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (productSearch) {
        handleProductSearch(productSearch);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  // Handle new customer creation
  const handleCreateCustomer = async (data: CustomerFormData) => {
    try {
      const response = await createCustomer(data as any);
      if (response.success) {
        toast.success("Customer created successfully!");
        setShowNewCustomerDialog(false);
        await loadCustomers();

        if (response.data) {
          setSelectedCustomer(response.data);
        }
      }
    } catch (error: any) {
      console.error("Create customer error:", error);
      toast.error(error.response?.data?.message || "Failed to create customer");
    }
  };

  // Calculate totals
  const subtotal = useMemo(() => {
    if (!selectedCustomer) return 0;

    return cart.reduce((sum, item) => {
      const price =
        selectedCustomer.customerType === "B2B"
          ? item.b2bSalePrice
          : item.b2cSalePrice;
      return sum + price * item.cartQuantity;
    }, 0);
  }, [cart, selectedCustomer]);

  const taxTotal = useMemo(() => {
    if (!selectedCustomer) return 0;

    return cart.reduce((sum, item) => {
      const price =
        selectedCustomer.customerType === "B2B"
          ? item.b2bSalePrice
          : item.b2cSalePrice;
      const tax = item.salesTax || 0;
      const priceWithQty = price * item.cartQuantity;
      const taxAmount = (priceWithQty * tax) / (100 + tax);
      return sum + taxAmount;
    }, 0);
  }, [cart, selectedCustomer]);

  const baseTotal = useMemo(() => {
    if (!selectedCustomer) return 0;

    return cart.reduce((sum, item) => {
      const price =
        selectedCustomer.customerType === "B2B"
          ? item.b2bSalePrice
          : item.b2cSalePrice;
      const tax = item.salesTax || 0;
      const priceWithQty = price * item.cartQuantity;
      const taxAmount = (priceWithQty * tax) / (100 + tax);
      const baseAmount = priceWithQty - taxAmount;
      return sum + baseAmount;
    }, 0);
  }, [cart, selectedCustomer]);

  const discountAmount = (subtotal * discount) / 100;
  const grandTotal = subtotal - discountAmount + freightCharge;
  const balance = paidAmount - grandTotal;
  const roundedGrandTotal = Math.round(grandTotal);
  const roundOffAmount = roundedGrandTotal - grandTotal;

  // Handle generate invoice
  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!paymentMode) {
      toast.error("Please select payment mode");
      return;
    }

    // Validate Pay Later remarks
    if (
      paymentMode === "Pay Later" &&
      (!payLaterRemarks || payLaterRemarks.trim() === "")
    ) {
      toast.error("Please enter remarks for Pay Later payment");
      return;
    }

    setIsLoading(true);

    try {
      const billingId = await generateInvoice(
        paymentMode,
        discount,
        freightCharge,
        payLaterRemarks,
      );

      if (billingId) {
        const response = await getBillingById(billingId);

        if (response.success && response.data) {
          setBillingData(response.data);
          setPaymentMode("");
          setFreightCharge(0);
          setPayLaterRemarks("");
          setShowRemarksInput(false);
        }
      }
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while restoring session
  if (!isLoaded) {
    return <BillingPageSkeleton />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 print:p-0">
      {/* Header with Reset Button */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl md:text-3xl font-bold">Billing to Customer</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {format(new Date(), "dd MMM yyyy, hh:mm a")}
          </Badge>
          {(selectedCustomer || cart.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (
                  window.confirm(
                    "Clear current billing session? This will delete the draft.",
                  )
                ) {
                  await clearSession();
                  toast.success("Session cleared");
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Bill
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card - Keep as is */}
          <Card
            className={`print:hidden border-2 ${
              !selectedCustomer ? "border-red-200 bg-red-50/50" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Customer Details
                  {!selectedCustomer && (
                    <Badge variant="destructive" className="ml-2">
                      Required
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Search - Keep as is */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search customer by name, email, phone, company, GST..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerResults(true);
                    }}
                    onFocus={() => setShowCustomerResults(true)}
                    className="pl-10"
                    disabled={!!selectedCustomer}
                  />

                  {/* Search Results Dropdown */}
                  {showCustomerResults &&
                    customerSearch.trim() !== "" &&
                    !selectedCustomer && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                        {isLoadingCustomers ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                          </div>
                        ) : filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <div
                              key={customer._id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {customer.customerType === "B2B" ? (
                                    <Building2 className="w-4 h-4 text-purple-600" />
                                  ) : (
                                    <User className="w-4 h-4 text-green-600" />
                                  )}
                                  <div>
                                    <span className="font-medium">
                                      {customer.name}
                                    </span>
                                    {customer.customerType === "B2B" &&
                                      customer.companyName && (
                                        <span className="text-sm text-gray-500 ml-2">
                                          {customer.companyName}
                                        </span>
                                      )}
                                  </div>
                                </div>
                                <Badge
                                  className={getTypeBadge(
                                    customer.customerType,
                                  )}
                                >
                                  {customer.customerType}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {customer.email && (
                                  <span>{customer.email} • </span>
                                )}
                                {customer.mobile && (
                                  <span>{customer.mobile}</span>
                                )}
                              </div>
                              {customer.customerType === "B2B" &&
                                customer.gstIn && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    GST: {customer.gstIn}
                                  </div>
                                )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No customers found.{" "}
                            <button
                              onClick={() => {
                                setShowCustomerResults(false);
                                setShowNewCustomerDialog(true);
                              }}
                              className="text-indigo-600 hover:underline"
                            >
                              Create new customer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Add New Customer Button */}
                <Button
                  onClick={() => setShowNewCustomerDialog(true)}
                  disabled={!!selectedCustomer}
                  variant={selectedCustomer ? "outline" : "default"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Customer
                </Button>
              </div>

              {/* Selected Customer Display */}
              {selectedCustomer && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          selectedCustomer.customerType === "B2B"
                            ? "bg-purple-100"
                            : "bg-green-100"
                        }`}
                      >
                        {selectedCustomer.customerType === "B2B" ? (
                          <Building2 className="w-5 h-5 text-purple-600" />
                        ) : (
                          <User className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-lg">
                            {selectedCustomer.name}
                          </p>
                          <Badge
                            className={getTypeBadge(
                              selectedCustomer.customerType,
                            )}
                          >
                            {selectedCustomer.customerType}
                          </Badge>
                        </div>
                        {selectedCustomer.customerType === "B2B" && (
                          <>
                            <p className="text-sm text-gray-600">
                              {selectedCustomer.companyName}
                            </p>
                            <p className="text-sm text-gray-500">
                              GST: {selectedCustomer.gstIn}
                            </p>
                          </>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedCustomer.email} • {selectedCustomer.mobile}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedCustomer.address}, {selectedCustomer.city},{" "}
                          {selectedCustomer.state}, {selectedCustomer.country}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Changing customer will delete the current draft. Continue?",
                          )
                        ) {
                          await setSelectedCustomer(null);
                          clearCart();
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

              {/* Customer Required Message */}
              {!selectedCustomer && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">
                    Please select a customer to start billing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Combined Search & Scan Card */}
          <Card
            className={`print:hidden ${!selectedCustomer ? "opacity-50" : ""}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search or Scan Product
                {!selectedCustomer && (
                  <Lock className="w-4 h-4 text-gray-400 ml-2" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder={
                      selectedCustomer
                        ? "Search by name/barcode or scan barcode..."
                        : "Select a customer first"
                    }
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onFocus={() =>
                      selectedCustomer && setShowSearchResults(true)
                    }
                    className="pl-10"
                    disabled={!selectedCustomer || loading}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}

                  {/* Search Results Dropdown */}
                  {showSearchResults &&
                    selectedCustomer &&
                    productSearch.trim() !== "" && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((product) => (
                            <div
                              key={product._id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                              onClick={() => handleSearchResultClick(product)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">
                                      {product.productName}
                                    </span>
                                    {product.quantity <= 0 && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        Out of Stock
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    <span className="text-xs">
                                      Barcode: {product.barCode}
                                    </span>
                                    {product.color && (
                                      <span className="ml-2 text-xs">
                                        Color: {product.color}
                                      </span>
                                    )}
                                    {product.size && (
                                      <span className="ml-2 text-xs">
                                        Size: {product.size}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Stock: {product.quantity} units
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-indigo-600">
                                    ₹
                                    {selectedCustomer?.customerType === "B2B"
                                      ? product.b2bSalePrice
                                      : product.b2cSalePrice}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No products found matching "{productSearch}"
                          </div>
                        )}
                      </div>
                    )}
                </div>
                <Button
                  type="button"
                  disabled={
                    !selectedCustomer || loading || !productSearch.trim()
                  }
                  variant={
                    selectedCustomer && productSearch.trim()
                      ? "default"
                      : "outline"
                  }
                  onClick={handleBarcodeScan}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Type to search by name/barcode or scan barcode. If multiple
                products found, you'll be prompted to select one.
              </p>
            </CardContent>
          </Card>

          {/* Cart Table Card - Keep as is */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Current Bill</CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            {cart.length > 0 && (
              <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg mx-6">
                <div>
                  <span className="text-sm text-gray-600">Total Products:</span>
                  <span className="ml-2 font-semibold">{cart.length}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Quantity:</span>
                  <span className="ml-2 font-semibold">
                    {cart.reduce((sum, item) => sum + item.cartQuantity, 0)}
                  </span>
                </div>
              </div>
            )}
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No items in cart</p>
                  <p className="text-sm">
                    {selectedCustomer
                      ? "Search or scan barcode to add products"
                      : "Select a customer to start"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">
                          Price (Inc. Tax)
                        </TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit</TableHead>
                        <TableHead className="text-right">SGST</TableHead>
                        <TableHead className="text-right">CGST</TableHead>
                        <TableHead className="text-right">Base Amt</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right w-[100px]">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => {
                        const price =
                          selectedCustomer?.customerType === "B2B"
                            ? item.b2bSalePrice
                            : item.b2cSalePrice;
                        const tax = item.salesTax || 0;
                        const priceWithQty = price * item.cartQuantity;
                        const taxAmount = (priceWithQty * tax) / (100 + tax);
                        const baseAmount = priceWithQty - taxAmount;
                        const itemTotal = priceWithQty;

                        return (
                          <TableRow key={item._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {item.productName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Code: {item.itemCode || item.barCode}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 cursor-pointer"
                                  onClick={() =>
                                    updateQuantity(
                                      item._id,
                                      item.cartQuantity - 1,
                                    )
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">
                                  {item.cartQuantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 cursor-pointer"
                                  onClick={() =>
                                    updateQuantity(
                                      item._id,
                                      item.cartQuantity + 1,
                                    )
                                  }
                                  disabled={item.cartQuantity >= item.quantity}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">Pcs.</TableCell>
                            <TableCell className="text-right">
                              ₹{(taxAmount / 2).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{(taxAmount / 2).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{baseAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{itemTotal.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 cursor-pointer hover:bg-red-50"
                                onClick={() => removeFromCart(item._id)}
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

        {/* Right Column - Payment Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Type Badge */}
              {selectedCustomer && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer Type:</span>
                  <Badge
                    className={
                      selectedCustomer.customerType === "B2B"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {selectedCustomer.customerType}
                  </Badge>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2">
                {/* 1. Base Amount */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Amount:</span>
                  <span className="font-medium">₹{baseTotal.toFixed(2)}</span>
                </div>

                {/* 2. Discount on Base Amount */}
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-gray-600">Discount (%):</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={discount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 0 && val <= 100) {
                          setDiscount(val);
                        }
                      }}
                      className="w-20 h-8 text-sm"
                      disabled={cart.length === 0}
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  {discount > 0 && (
                    <div className="text-right">
                      <span className="ml-2 font-medium text-red-600">
                        -₹{discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Amount after Discount */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount after Discount:</span>
                  <span className="font-medium">
                    ₹{(baseTotal - discountAmount).toFixed(2)}
                  </span>
                </div>

                {/* 4. Tax Breakdown (SGST & CGST) */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST:</span>
                    <span className="font-medium">
                      ₹{(taxTotal / 2).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST:</span>
                    <span className="font-medium">
                      ₹{(taxTotal / 2).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Tax (GST):</span>
                    <span className="font-medium">₹{taxTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* 5. Subtotal after tax */}
                {/* <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-600">Subtotal (After Tax):</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div> */}

                {/* 6. Freight Charge */}
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-gray-600">
                      Freight Charge:
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={freightCharge}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                          setFreightCharge(val);
                        }
                      }}
                      className="w-24 h-8 text-sm"
                      disabled={cart.length === 0}
                    />
                    <span className="text-sm text-gray-500">₹</span>
                  </div>
                  {freightCharge > 0 && (
                    <div className="text-right">
                      <span className="ml-2 font-medium text-blue-600">
                        +₹{freightCharge.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-2" />

                {/* 7. Grand Total (Before Rounding) */}
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* 8. Rounded Off */}
                {roundOffAmount !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rounded Off:</span>
                    <span
                      className={`font-medium ${
                        roundOffAmount > 0 ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {roundOffAmount > 0
                        ? `+₹${roundOffAmount.toFixed(2)}`
                        : `-₹${Math.abs(roundOffAmount).toFixed(2)}`}
                    </span>
                  </div>
                )}

                {/* 9. Final Rounded Total */}
                <div className="flex justify-between font-bold text-xl pt-2 border-t-2 border-gray-200">
                  <span>Rounded Total:</span>
                  <span className="text-green-600">
                    ₹{roundedGrandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Mode Selection - Same as before */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Payment Mode <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {/* Payment buttons - keep as is */}
                  <Button
                    type="button"
                    variant={paymentMode === "Cash" ? "default" : "outline"}
                    className={`cursor-pointer ${
                      paymentMode === "Cash"
                        ? "bg-green-600 hover:bg-green-700"
                        : "hover:bg-green-50"
                    }`}
                    onClick={() => {
                      setPaymentMode("Cash");
                      setShowRemarksInput(false);
                      setPayLaterRemarks("");
                    }}
                    disabled={cart.length === 0}
                  >
                    Cash
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMode === "UPI" ? "default" : "outline"}
                    className={`cursor-pointer ${
                      paymentMode === "UPI"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-blue-50"
                    }`}
                    onClick={() => {
                      setPaymentMode("UPI");
                      setShowRemarksInput(false);
                      setPayLaterRemarks("");
                    }}
                    disabled={cart.length === 0}
                  >
                    UPI
                  </Button>
                  <Button
                    type="button"
                    variant={
                      paymentMode === "Debit/Credit Card"
                        ? "default"
                        : "outline"
                    }
                    className={`cursor-pointer ${
                      paymentMode === "Debit/Credit Card"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "hover:bg-purple-50"
                    }`}
                    onClick={() => {
                      setPaymentMode("Debit/Credit Card");
                      setShowRemarksInput(false);
                      setPayLaterRemarks("");
                    }}
                    disabled={cart.length === 0}
                  >
                    Card
                  </Button>
                  <Button
                    type="button"
                    variant={
                      paymentMode === "Pay Later" ? "default" : "outline"
                    }
                    className={`cursor-pointer ${
                      paymentMode === "Pay Later"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "hover:bg-orange-50"
                    }`}
                    onClick={() => {
                      setPaymentMode("Pay Later");
                      setShowRemarksInput(true);
                    }}
                    disabled={cart.length === 0}
                  >
                    Pay Later
                  </Button>
                </div>

                {/* Remarks Input for Pay Later */}
                {showRemarksInput && paymentMode === "Pay Later" && (
                  <div className="mt-3">
                    <Label className="text-sm font-medium text-gray-700 mb-1 block">
                      Remarks <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter reason for Pay Later (e.g., Credit sale, Due payment, etc.)"
                      value={payLaterRemarks}
                      onChange={(e) => setPayLaterRemarks(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required: Please provide remarks for this Pay Later
                      transaction
                    </p>
                  </div>
                )}

                {cart.length > 0 && !paymentMode && (
                  <p className="text-xs text-amber-600">
                    Please select payment mode
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button
                  className="w-full cursor-pointer print:hidden"
                  size="lg"
                  onClick={handleGenerateInvoice}
                  disabled={
                    !selectedCustomer ||
                    cart.length === 0 ||
                    !paymentMode ||
                    isLoading ||
                    (paymentMode === "Pay Later" && !payLaterRemarks.trim())
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Generate Invoice
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Customer Dialog */}
      <Dialog
        open={showNewCustomerDialog}
        onOpenChange={setShowNewCustomerDialog}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreateCustomer}
            isLoading={isLoadingCustomers}
            onCancel={() => setShowNewCustomerDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Product Selection Dialog for Multiple Products */}
      <Dialog
        open={showProductSelectionDialog}
        onOpenChange={setShowProductSelectionDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Multiple products found with barcode "{selectedBarcode}". Please
              select one:
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {multipleProducts.map((product) => (
                <div
                  key={product._id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleAddSelectedProduct(product)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <div className="text-sm text-gray-500 mt-1">
                        {product.color && <span>Color: {product.color}</span>}
                        {product.size && (
                          <span className="ml-2">Size: {product.size}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Stock: {product.quantity} units
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">
                        ₹
                        {selectedCustomer?.customerType === "B2B"
                          ? product.b2bSalePrice
                          : product.b2cSalePrice}
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Layout - Keep as is */}
      <div
        className="hidden print:block mt-10"
        style={{
          fontFamily: "Arial, sans-serif",
          wordWrap: "break-word",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Retail Craft</h1>
          <p>Invoice #{format(new Date(), "yyyyMMddHHmmss")}</p>
          <p>Date: {format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
        </div>

        <div className="mb-4">
          <h2 className="font-bold">Customer Details:</h2>
          {selectedCustomer ? (
            <div className="text-sm">
              <p>Name: {selectedCustomer.name}</p>
              {selectedCustomer.customerType === "B2B" && (
                <>
                  <p>Company: {selectedCustomer.companyName}</p>
                  <p>GST: {selectedCustomer.gstIn}</p>
                </>
              )}
              <p>Type: {selectedCustomer.customerType}</p>
              <p>Mobile: {selectedCustomer.mobile}</p>
            </div>
          ) : (
            <p className="text-sm">No customer selected</p>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Product</th>
              <th className="text-right py-2">Price</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Tax %</th>
              <th className="text-right py-2">Tax Amt</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => {
              const price =
                selectedCustomer?.customerType === "B2B"
                  ? item.b2bSalePrice
                  : item.b2cSalePrice;
              const tax = item.salesTax || 0;
              const priceWithQty = price * item.cartQuantity;
              const taxAmount = (priceWithQty * tax) / (100 + tax);
              const itemTotal = priceWithQty;

              return (
                <tr key={item._id} className="border-b">
                  <td className="py-2">{item.productName}</td>
                  <td className="text-right py-2">₹{price.toFixed(2)}</td>
                  <td className="text-center py-2">{item.cartQuantity}</td>
                  <td className="text-right py-2">{tax}%</td>
                  <td className="text-right py-2">₹{taxAmount.toFixed(2)}</td>
                  <td className="text-right py-2">₹{itemTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 text-right space-y-1">
          <p>Base Amount: ₹{baseTotal.toFixed(2)}</p>
          <p>Total Tax: ₹{taxTotal.toFixed(2)}</p>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          {discount > 0 && <p>Discount: -₹{discountAmount.toFixed(2)}</p>}
          <p className="text-lg font-bold">
            Grand Total: ₹{grandTotal.toFixed(2)}
          </p>
          <p>Paid: ₹{paidAmount.toFixed(2)}</p>
          <p>Balance: ₹{balance.toFixed(2)}</p>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
        </div>
      </div>
      {billingData && (
        <ThermalInvoice
          billing={billingData}
          onPrinted={() => {
            setBillingData(null);
          }}
        />
      )}
    </div>
  );
}
