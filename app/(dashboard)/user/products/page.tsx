"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getProducts,
  createProduct,
  updateProduct,
  Product,
  ProductFormData,
  getLowStockProducts,
  getStockSummary,
  deleteProduct,
} from "@/lib/api/products";
import ProductForm from "@/components/forms/ProductForm";
import { StockManager } from "@/components/inventory/StockManager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit,
  Loader2,
  Package,
  Barcode,
  Tag,
  Hash,
  Percent,
  Box,
  AlertTriangle,
  Palette,
  Ruler,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import AppPagination from "@/components/common/AppPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Size colors for visual distinction
const SIZE_COLORS: Record<string, string> = {
  S: "bg-blue-100 text-blue-800",
  M: "bg-green-100 text-green-800",
  L: "bg-yellow-100 text-yellow-800",
  XL: "bg-purple-100 text-purple-800",
  XXL: "bg-red-100 text-red-800",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Active" | "Inactive" | "All"
  >("Active");
  const [stockSummary, setStockSummary] = useState({
    totalProducts: 0,
    totalStock: 0,
  });
  const [lowStockCount, setLowStockCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      // Call your delete API endpoint here
      const response = await deleteProduct(selectedProduct._id);
      if (response.success) {
        toast.success("Product deleted successfully!");
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        fetchAllProducts(); // Refresh the product list
        fetchStockSummary();
        fetchLowStockCount();
      }
    } catch (error: any) {
      console.error("Delete product error:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Fetch ALL products (no status filter from API)
  const fetchAllProducts = async () => {
    try {
      setIsLoading(true);
      // Pass "All" to get all products regardless of status
      const response = await getProducts("All");
      if (response.success && response.data) {
        setAllProducts(response.data);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stock summary
  const fetchStockSummary = async () => {
    try {
      const response = await getStockSummary();
      if (response.success) {
        setStockSummary({
          totalProducts: response.totalProducts,
          totalStock: response.totalStock,
        });
      }
    } catch (error) {
      console.error("Error loading stock summary:", error);
    }
  };

  // Fetch low stock count
  const fetchLowStockCount = async () => {
    try {
      const response = await getLowStockProducts();
      if (response.success) {
        setLowStockCount(response.data?.length || 0);
      }
    } catch (error) {
      console.error("Error loading low stock:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchStockSummary();
    fetchLowStockCount();
  }, []); // Remove statusFilter dependency

  // Calculate counts for tabs based on actual data
  const activeCount = useMemo(
    () => allProducts.filter((p) => p.quantity > 0).length,
    [allProducts],
  );

  const inactiveCount = useMemo(
    () => allProducts.filter((p) => p.quantity === 0).length,
    [allProducts],
  );

  const allCount = allProducts.length;

  // Filter products based on search AND status (frontend filtering)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // First apply status filter based on QUANTITY (not API status)
      if (statusFilter === "Active") {
        if (product.quantity === 0) return false; // Only show products with quantity > 0
      } else if (statusFilter === "Inactive") {
        if (product.quantity > 0) return false; // Only show products with quantity = 0
      }
      // 'All' shows everything, no filtering

      // Then apply search filter
      return (
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [allProducts, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle create product
  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      const response = await createProduct(data);
      if (response.success) {
        toast.success("Product created successfully!");
        setIsCreateOpen(false);
        fetchAllProducts(); // Refresh all products
        fetchStockSummary();
        fetchLowStockCount();
      }
    } catch (error: any) {
      console.error("Create product error:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    }
  };

  // Handle update product
  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!selectedProduct) return;

    try {
      // Remove fields that cannot be updated directly
      const { quantity, ...updateData } = data;

      const response = await updateProduct(selectedProduct._id, updateData);
      if (response.success) {
        toast.success("Product updated successfully!");
        setIsEditOpen(false);
        setSelectedProduct(null);
        fetchAllProducts(); // Refresh all products
      }
    } catch (error: any) {
      console.error("Update product error:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
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

  // Get stock badge color
  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return "bg-gray-100 text-gray-500";
    if (stock <= 5) return "bg-red-100 text-red-800";
    if (stock <= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500">Manage your products and inventory</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Products
                </p>
                <p className="text-3xl font-bold">
                  {stockSummary.totalProducts}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Units</p>
                <p className="text-3xl font-bold">{stockSummary.totalStock}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Box className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {lowStockCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  In Stock Products
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {activeCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Power className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter Tabs with Counts */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as any)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-[500px]">
            <TabsTrigger value="Active" className="relative cursor-pointer">
              In Stock
              <Badge
                variant="secondary"
                className="ml-2 bg-green-100 text-green-800"
              >
                {activeCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="Inactive" className="relative cursor-pointer">
              Out of Stock
              <Badge
                variant="secondary"
                className="ml-2 bg-gray-100 text-gray-800"
              >
                {inactiveCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="All" className="relative cursor-pointer">
              All
              <Badge
                variant="secondary"
                className="ml-2 bg-blue-100 text-blue-800"
              >
                {allCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products by name, barcode, color, or item code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm
                ? "No products match your search"
                : statusFilter === "Active"
                ? "No products in stock"
                : statusFilter === "Inactive"
                ? "No out of stock products"
                : "No products found"}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? "Try a different search term"
                : "Click the button above to add your first product"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch w-full">
          {paginatedProducts.map((product) => {
            const isInactive = product.quantity === 0;

            return (
              <Card
                key={product._id}
                className={`hover:shadow-lg transition-shadow flex flex-col h-full min-w-0 ${
                  isInactive ? "opacity-60 bg-gray-50 border-gray-200" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Package
                        className={`w-5 h-5 ${
                          isInactive ? "text-gray-400" : "text-blue-600"
                        }`}
                      />
                      <CardTitle
                        className={`text-lg ${
                          isInactive ? "text-gray-500" : ""
                        }`}
                      >
                        {product.productName}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {/* Status Badge - based on quantity */}
                      {product.quantity === 0 ? (
                        <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                          <PowerOff className="w-3 h-3 mr-1" />
                          Out of Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <Power className="w-3 h-3 mr-1" />
                          In Stock
                        </Badge>
                      )}

                      {/* Low Stock Badge (only if in stock but low) */}
                      {product.quantity > 0 && product.quantity <= 5 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Barcode
                        className={`w-3 h-3 ${
                          isInactive ? "text-gray-400" : ""
                        }`}
                      />
                      <span
                        className={`font-mono ${
                          isInactive ? "text-gray-500" : ""
                        }`}
                      >
                        Barcode: {product.barCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Palette
                        className={`w-3 h-3 ${
                          isInactive ? "text-gray-400" : ""
                        }`}
                      />
                      <span className={isInactive ? "text-gray-500" : ""}>
                        Color: {product.color}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Ruler
                        className={`w-3 h-3 ${
                          isInactive ? "text-gray-400" : ""
                        }`}
                      />
                      <Badge
                        className={`${
                          SIZE_COLORS[product.size] || "bg-gray-100"
                        } ${isInactive ? "opacity-50" : ""}`}
                      >
                        Size {product.size}
                      </Badge>
                    </div>
                    {product.itemCode && (
                      <div className="flex items-center gap-2 text-xs">
                        <Tag
                          className={`w-3 h-3 ${
                            isInactive ? "text-gray-400" : ""
                          }`}
                        />
                        <span className={isInactive ? "text-gray-500" : ""}>
                          Item Code: {product.itemCode}
                        </span>
                      </div>
                    )}
                    {product.hsnCode && (
                      <div className="flex items-center gap-2 text-xs">
                        <Hash
                          className={`w-3 h-3 ${
                            isInactive ? "text-gray-400" : ""
                          }`}
                        />
                        <span className={isInactive ? "text-gray-500" : ""}>
                          HSN: {product.hsnCode}
                        </span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  {/* Stock Quantity */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isInactive ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      Stock:
                    </span>
                    <Badge className={getStockBadgeColor(product.quantity)}>
                      {product.quantity} units
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Percent
                      className={`w-4 h-4 ${
                        isInactive ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <span className={isInactive ? "text-gray-500" : ""}>
                      Sales Tax: {product.salesTax}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t">
                    <div className="text-center">
                      <p
                        className={`text-xs ${
                          isInactive ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        B2B
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          isInactive ? "text-gray-500" : "text-blue-600"
                        }`}
                      >
                        {formatCurrency(product.b2bSalePrice)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-xs ${
                          isInactive ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        B2C
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          isInactive ? "text-gray-500" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(product.b2cSalePrice)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-xs ${
                          isInactive ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Purchase
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          isInactive ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        {formatCurrency(product.purchasePrice)}
                      </p>
                    </div>
                  </div>

                  {product.shortDescription && (
                    <p
                      className={`text-xs line-clamp-2 mt-2 min-h-[32px] ${
                        isInactive ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {product.shortDescription}
                    </p>
                  )}

                  <p
                    className={`text-xs mt-2 ${
                      isInactive ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    Added:{" "}
                    {product.createdAt &&
                    !isNaN(new Date(product.createdAt).getTime())
                      ? format(new Date(product.createdAt), "dd MMM yyyy")
                      : "N/A"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center mt-auto border-t pt-4">
                  {/* Always show Stock button, even for inactive products */}
                  <Button
                    variant={isInactive ? "outline" : "default"}
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsStockDialogOpen(true);
                    }}
                    className={
                      !isInactive
                        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        : "cursor-pointer border-blue-300 text-blue-600 hover:bg-blue-50"
                    }
                  >
                    <Box className="w-4 h-4 mr-1" />
                    {isInactive ? "Add Stock" : "Manage Stock"}
                  </Button>

                  {/* Edit button - always visible but with appropriate styling */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {/* Delete button - only visible when quantity is 0 */}
                  {product.quantity === 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-center relative gap-4">
          {/* Pagination */}
          <div className="flex justify-center w-full md:w-auto">
            <AppPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* Items Per Page */}
          <div className="flex justify-center md:justify-end md:absolute md:right-0 mt-6">
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 / page</SelectItem>
                <SelectItem value="12">12 / page</SelectItem>
                <SelectItem value="24">24 / page</SelectItem>
                <SelectItem value="48">48 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Create Product Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreateProduct}
            isLoading={isLoading}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              initialData={{
                productName: selectedProduct.productName,
                itemCode: selectedProduct.itemCode,
                barCode: selectedProduct.barCode,
                color: selectedProduct.color,
                size: selectedProduct.size,
                quantity: selectedProduct.quantity,
                hsnCode: selectedProduct.hsnCode,
                salesTax: selectedProduct.salesTax,
                shortDescription: selectedProduct.shortDescription,
                b2bSalePrice: selectedProduct.b2bSalePrice,
                b2cSalePrice: selectedProduct.b2cSalePrice,
                purchasePrice: selectedProduct.purchasePrice,
              }}
              onSubmit={handleUpdateProduct}
              isLoading={isLoading}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedProduct(null);
              }}
              isEditMode={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{selectedProduct?.productName}" and remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProduct(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stock Management Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Manage Stock - {selectedProduct?.productName}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && user?.branchId && (
            <StockManager
              productId={selectedProduct._id}
              productName={selectedProduct.productName}
              currentStock={selectedProduct.quantity}
              onStockUpdate={() => {
                fetchAllProducts();
                fetchStockSummary();
                fetchLowStockCount();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
