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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface BillingItem extends Product {
  cartQuantity: number;
}

export default function BillingPage() {
  const { user } = useAuth();
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // State
  const [customerType, setCustomerType] = useState<"B2B" | "B2C">("B2C");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  console.log("Customers loaded:", customers);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<BillingItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  console.log("Products loaded:", products);
  const [loading, setLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">(
    "cash",
  );
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Load products on mount
  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

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

  // Filter customers based on search and type
  const filteredCustomers = customers.filter((customer) => {
    const matchesType = customer.customerType === customerType;
    const matchesSearch =
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.mobile?.includes(customerSearch) ||
      (customer.customerType === "B2B" &&
        customer.companyName
          ?.toLowerCase()
          .includes(customerSearch.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Handle barcode scan
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barcode.trim()) return;

    setLoading(true);
    try {
      // Find product by barcode
      const product = products.find((p) => p.barCode === barcode);

      if (!product) {
        toast.error("Product not found with this barcode");
        setBarcode("");
        return;
      }

      // Check stock
      if (product.quantity <= 0) {
        toast.error(`${product.productName} is out of stock`);
        setBarcode("");
        return;
      }

      // Add to cart
      const existingItem = cart.find((item) => item._id === product._id);

      if (existingItem) {
        // Check if enough stock
        if (existingItem.quantity < existingItem.cartQuantity + 1) {
          toast.error(`Only ${existingItem.quantity} items in stock`);
          setBarcode("");
          return;
        }

        setCart(
          cart.map((item) =>
            item._id === product._id
              ? { ...item, cartQuantity: item.cartQuantity + 1 }
              : item,
          ),
        );
      } else {
        setCart([
          ...cart,
          {
            ...product,
            cartQuantity: 1,
          },
        ]);
      }

      toast.success(`${product.productName} added to cart`);
      setBarcode("");
    } catch (error) {
      console.error("Error scanning barcode:", error);
      toast.error("Error processing barcode");
    } finally {
      setLoading(false);
    }
  };

  // Manual product search
  const handleManualAdd = (product: Product) => {
    if (product.quantity <= 0) {
      toast.error(`${product.productName} is out of stock`);
      return;
    }

    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      if (existingItem.quantity < existingItem.cartQuantity + 1) {
        toast.error(`Only ${existingItem.quantity} items in stock`);
        return;
      }

      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          cartQuantity: 1,
        },
      ]);
    }

    toast.success(`${product.productName} added to cart`);
  };

  // Update quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = cart.find((item) => item._id === productId);
    if (!product) return;

    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    if (newQuantity > product.quantity) {
      toast.error(`Only ${product.quantity} items available`);
      return;
    }

    setCart(
      cart.map((item) =>
        item._id === productId ? { ...item, cartQuantity: newQuantity } : item,
      ),
    );
  };

  // Remove item
  const removeItem = (productId: string) => {
    setCart(cart.filter((item) => item._id !== productId));
    toast.success("Item removed from cart");
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  // Handle new customer creation
  const handleCreateCustomer = async (data: CustomerFormData) => {
    try {
      const response = await createCustomer(data as any);
      if (response.success) {
        toast.success("Customer created successfully!");
        setShowNewCustomerDialog(false);
        await loadCustomers();

        // Auto-select the new customer
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
    return cart.reduce((sum, item) => {
      const price =
        customerType === "B2B" ? item.b2bSalePrice : item.b2cSalePrice;
      return sum + price * item.cartQuantity;
    }, 0);
  }, [cart, customerType]);

  const taxTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price =
        customerType === "B2B" ? item.b2bSalePrice : item.b2cSalePrice;
      const tax = parseFloat(item.salesTax) || 0;
      return sum + (price * item.cartQuantity * tax) / 100;
    }, 0);
  }, [cart, customerType]);

  const discountAmount = (subtotal * discount) / 100;
  const grandTotal = subtotal + taxTotal - discountAmount;
  const balance = paidAmount - grandTotal;

  // Handle payment
  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!selectedCustomer && customerType === "B2B") {
      toast.error("Please select a B2B customer");
      return;
    }

    if (paidAmount < grandTotal) {
      toast.error("Insufficient payment amount");
      return;
    }

    // Here you would call your billing API
    toast.success("Invoice created successfully!");
    handlePrint();
  };

  // Print invoice
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl md:text-3xl font-bold">Billing</h1>
        <Badge variant="outline" className="text-sm">
          {format(new Date(), "dd MMM yyyy, hh:mm a")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <Card className="print:hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Customer Details
                </CardTitle>
                <Tabs
                  value={customerType}
                  onValueChange={(v) => {
                    setCustomerType(v as "B2B" | "B2C");
                    setSelectedCustomer(null);
                  }}
                >
                  <TabsList>
                    <TabsTrigger value="B2C">B2C</TabsTrigger>
                    <TabsTrigger value="B2B">B2B</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {customerType === "B2B" ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search B2B customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Dialog
                      open={showCustomerDialog}
                      onOpenChange={setShowCustomerDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Search className="w-4 h-4 mr-2" />
                          Browse
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Select B2B Customer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Search customers..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isLoadingCustomers ? (
                              <div className="col-span-2 flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                              </div>
                            ) : filteredCustomers.length === 0 ? (
                              <div className="col-span-2 text-center py-8 text-gray-500">
                                No customers found.{" "}
                                <button
                                  onClick={() => {
                                    setShowCustomerDialog(false);
                                    setShowNewCustomerDialog(true);
                                  }}
                                  className="text-indigo-600 hover:underline"
                                >
                                  Create new
                                </button>
                              </div>
                            ) : (
                              filteredCustomers.map((customer) => (
                                <Card
                                  key={customer._id}
                                  className="cursor-pointer hover:border-indigo-500 transition-colors"
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setShowCustomerDialog(false);
                                  }}
                                >
                                  <CardContent className="p-4">
                                    <div className="font-medium">
                                      {customer.name}
                                    </div>
                                    {customer.companyName && (
                                      <div className="text-sm text-gray-500">
                                        {customer.companyName}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-2">
                                      {customer.city}, {customer.state}
                                    </div>
                                    {customer.gstIn && (
                                      <Badge className="mt-2 bg-purple-100 text-purple-800">
                                        GST: {customer.gstIn}
                                      </Badge>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={() => setShowNewCustomerDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New
                    </Button>
                  </div>

                  {selectedCustomer && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{selectedCustomer.name}</p>
                          <p className="text-sm text-gray-600">
                            {selectedCustomer.companyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            GST: {selectedCustomer.gstIn}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomer(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  placeholder="Customer Name (Optional for B2C)"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          {/* Barcode Scanner Card */}
          <Card className="print:hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Barcode className="w-5 h-5" />
                Scan Barcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeScan} className="flex gap-2">
                <div className="flex-1 relative">
                  <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="Scan or enter barcode..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading}>
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
          <Card className="print:hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Quick Products
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
                    disabled={product.quantity === 0}
                  >
                    <span className="font-medium text-sm">
                      {product.productName}
                    </span>
                    <span className="text-xs text-gray-500">
                      ₹
                      {customerType === "B2B"
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
                  <p className="text-sm">Scan barcode to add products</p>
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
                          customerType === "B2B"
                            ? item.b2bSalePrice
                            : item.b2cSalePrice;
                        const tax = parseFloat(item.salesTax) || 0;
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
                                onClick={() => removeItem(item._id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
                />
              </div>

              {/* Balance */}
              {paidAmount > 0 && (
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
                  disabled={cart.length === 0 || paidAmount < grandTotal}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Complete Payment
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrint}
                  disabled={cart.length === 0}
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
            <DialogTitle>Add New {customerType} Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            initialData={{ customerType }}
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
              <p>Company: {selectedCustomer.companyName}</p>
              <p>GST: {selectedCustomer.gstIn}</p>
            </div>
          ) : (
            <p className="text-sm">
              Customer: {customerSearch || "Walk-in Customer"}
            </p>
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
                customerType === "B2B" ? item.b2bSalePrice : item.b2cSalePrice;
              const tax = parseFloat(item.salesTax) || 0;
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
