"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
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
import { getProducts, Product } from "@/lib/api/products";
import {
  getCustomers,
  createCustomer,
  Customer,
  CustomerFormData,
} from "@/lib/api/customers";
import CustomerForm from "@/components/forms/CustomerForm";
import { useBillingStore } from "@/lib/hooks/useBillingStore";

interface BillingItem extends Product {
  cartQuantity: number;
}

export default function BillingPage() {
  const { user } = useAuth();
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Use billing store for persistence
  const {
    selectedCustomer,
    cart,
    discount,
    paymentMethod,
    paidAmount,
    isLoaded,
    setSelectedCustomer,
    setDiscount,
    setPaymentMethod,
    setPaidAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearSession,
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
      const response = await getProducts();
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

  // Handle barcode scan
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }

    if (!barcode.trim()) return;

    setLoading(true);
    try {
      const product = products.find((p) => p.barCode === barcode);

      if (!product) {
        toast.error("Product not found with this barcode");
        setBarcode("");
        return;
      }

      if (product.quantity <= 0) {
        toast.error(`${product.productName} is out of stock`);
        setBarcode("");
        return;
      }

      addToCart(product);
      toast.success(`${product.productName} added to cart`);
      setBarcode("");
    } catch (error) {
      console.error("Error scanning barcode:", error);
      toast.error("Error processing barcode");
    } finally {
      setLoading(false);
    }
  };

  // Manual product add
  const handleManualAdd = (product: Product) => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }

    if (product.quantity <= 0) {
      toast.error(`${product.productName} is out of stock`);
      return;
    }

    addToCart(product);
    toast.success(`${product.productName} added to cart`);
  };

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
      return sum + (price * item.cartQuantity * tax) / 100;
    }, 0);
  }, [cart, selectedCustomer]);

  const discountAmount = (subtotal * discount) / 100;
  const grandTotal = subtotal + taxTotal - discountAmount;
  const balance = paidAmount - grandTotal;

  // Handle payment
  const handlePayment = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (paidAmount < grandTotal) {
      toast.error("Insufficient payment amount");
      return;
    }

    toast.success("Invoice created successfully!");
    handlePrint();
    clearSession(); // Clear session after successful payment
  };

  // Print invoice
  const handlePrint = () => {
    window.print();
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

  return (
    <div className="p-4 md:p-6 space-y-6 print:p-0">
      {/* Header with Reset Button */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl md:text-3xl font-bold">Billing</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {format(new Date(), "dd MMM yyyy, hh:mm a")}
          </Badge>
          {(selectedCustomer || cart.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm("Clear current billing session?")) {
                  clearSession();
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
          {/* Customer Selection Card */}
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
              {/* Customer Search */}
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
                        <p className="text-xs text-gray-400">
                          {selectedCustomer.city}, {selectedCustomer.state},{" "}
                          {selectedCustomer.country}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(null);
                        clearCart();
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

          {/* Barcode Scanner Card */}
          <Card
            className={`print:hidden ${!selectedCustomer ? "opacity-50" : ""}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Barcode className="w-5 h-5" />
                Scan Barcode
                {!selectedCustomer && (
                  <Lock className="w-4 h-4 text-gray-400 ml-2" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeScan} className="flex gap-2">
                <div className="flex-1 relative">
                  <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder={
                      selectedCustomer
                        ? "Scan or enter barcode..."
                        : "Select a customer first"
                    }
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="pl-10"
                    disabled={!selectedCustomer || loading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!selectedCustomer || loading}
                  variant={selectedCustomer ? "default" : "outline"}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Products Card */}
          <Card
            className={`print:hidden ${!selectedCustomer ? "opacity-50" : ""}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Quick Products
                {!selectedCustomer && (
                  <Lock className="w-4 h-4 text-gray-400 ml-2" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {products.slice(0, 8).map((product) => (
                  <Button
                    key={product._id}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => handleManualAdd(product)}
                    disabled={!selectedCustomer || product.quantity === 0}
                  >
                    <span className="font-medium text-sm">
                      {product.productName}
                    </span>
                    <span className="text-xs text-gray-500">
                      ₹
                      {selectedCustomer?.customerType === "B2B"
                        ? product.b2bSalePrice
                        : product.b2cSalePrice}
                    </span>
                    {product.quantity <= 5 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-50 text-red-600"
                      >
                        Stock: {product.quantity}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cart Table Card */}
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
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No items in cart</p>
                  <p className="text-sm">
                    {selectedCustomer
                      ? "Scan barcode to add products"
                      : "Select a customer to start"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Tax</TableHead>
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
                        const itemTotal =
                          price * item.cartQuantity +
                          (price * item.cartQuantity * tax) / 100;

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
                                  className="h-8 w-8"
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
                                  className="h-8 w-8"
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
                            <TableCell className="text-right">{tax}%</TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{itemTotal.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (GST):</span>
                  <span className="font-medium">₹{taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Discount (%):</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(parseFloat(e.target.value) || 0)
                      }
                      className="w-20 h-8 text-right"
                      min="0"
                      max="100"
                      disabled={!selectedCustomer}
                    />
                    <span className="font-medium">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v: typeof paymentMethod) =>
                    setPaymentMethod(v)
                  }
                  disabled={!selectedCustomer}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Paid Amount */}
              <div className="space-y-2">
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) =>
                    setPaidAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Enter amount"
                  disabled={!selectedCustomer}
                />
              </div>

              {/* Balance */}
              {paidAmount > 0 && selectedCustomer && (
                <div
                  className={`p-3 rounded-lg ${
                    balance >= 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Balance:</span>
                    <span className="text-lg font-bold">
                      ₹{balance.toFixed(2)}
                    </span>
                  </div>
                  {balance < 0 && (
                    <p className="text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Insufficient payment
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={
                    !selectedCustomer ||
                    cart.length === 0 ||
                    paidAmount < grandTotal
                  }
                >
                  <Check className="w-4 h-4 mr-2" />
                  Complete Payment
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrint}
                  disabled={!selectedCustomer || cart.length === 0}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
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

      {/* Print Layout */}
      <div className="hidden print:block mt-10">
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
              <th className="text-right py-2">Tax</th>
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
              const itemTotal =
                price * item.cartQuantity +
                (price * item.cartQuantity * tax) / 100;

              return (
                <tr key={item._id} className="border-b">
                  <td className="py-2">{item.productName}</td>
                  <td className="text-right py-2">₹{price.toFixed(2)}</td>
                  <td className="text-center py-2">{item.cartQuantity}</td>
                  <td className="text-right py-2">{tax}%</td>
                  <td className="text-right py-2">₹{itemTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 text-right space-y-1">
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>Tax: ₹{taxTotal.toFixed(2)}</p>
          <p>Discount: ₹{discountAmount.toFixed(2)}</p>
          <p className="text-lg font-bold">Total: ₹{grandTotal.toFixed(2)}</p>
          <p>Paid: ₹{paidAmount.toFixed(2)}</p>
          <p>Balance: ₹{balance.toFixed(2)}</p>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
