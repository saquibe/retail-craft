"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getProducts,
  createProduct,
  updateProduct,
  Product,
  ProductFormData,
  getLowStockProducts,
  getStockSummary,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
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

  // const itemsPerPage = 6;
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Fetch products with status filter
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const status =
        statusFilter === "All"
          ? "All"
          : statusFilter === "Inactive"
          ? "Inactive"
          : undefined;
      const response = await getProducts(status);
      // console.log("Fetched products:", response.data);
      if (response.success && response.data) {
        setProducts(response.data);
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
      // console.log("Stock summary response:", response);
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
    fetchProducts();
    fetchStockSummary();
    fetchLowStockCount();
    setCurrentPage(1);
  }, [statusFilter]);

  // Filter products based on search
  const filteredProducts = products.filter((product) => {
    return (
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
        fetchProducts();
        fetchStockSummary();
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
      const response = await updateProduct(selectedProduct._id, data);
      if (response.success) {
        toast.success("Product updated successfully!");
        setIsEditOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error: any) {
      console.error("Update product error:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  // Handle toggle product status (Active/Inactive)
  const handleToggleStatus = async () => {
    if (!selectedProduct) return;

    const newStatus =
      selectedProduct.status === "Active" ? "Inactive" : "Active";

    try {
      const response = await updateProduct(selectedProduct._id, {
        status: newStatus,
      });

      if (response.success) {
        toast.success(
          `Product ${
            newStatus === "Active" ? "activated" : "inactivated"
          } successfully!`,
        );
        setIsStatusDialogOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
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
        <Button onClick={() => setIsCreateOpen(true)}>
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
                  Active Products
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {products.filter((p) => p.status === "Active").length}
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
        {/* Status Filter Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as any)}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="Active">Active</TabsTrigger>
            <TabsTrigger value="Inactive">Inactive</TabsTrigger>
            <TabsTrigger value="All">All</TabsTrigger>
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
            <p className="text-gray-500 text-lg mb-2">No products found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? "Try a different search term"
                : "Click the button above to add your first product"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch w-full">
          {paginatedProducts.map((product) => (
            <Card
              key={product._id}
              className={`hover:shadow-lg transition-shadow flex flex-col h-full min-w-0 ${
                product.status === "Inactive" ? "opacity-75 bg-gray-50" : ""
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">
                      {product.productName}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {/* Status Badge */}
                    <Badge
                      className={
                        product.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {product.status === "Active" ? (
                        <Power className="w-3 h-3 mr-1" />
                      ) : (
                        <PowerOff className="w-3 h-3 mr-1" />
                      )}
                      {product.status}
                    </Badge>

                    {/* Low Stock Badge */}
                    {product.quantity <= 5 && product.quantity > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low
                      </Badge>
                    )}
                    {product.quantity === 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Barcode className="w-3 h-3" />
                    <span className="font-mono">
                      Barcode: {product.barCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Palette className="w-3 h-3" />
                    <span>Color: {product.color}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Ruler className="w-3 h-3" />
                    <Badge
                      className={SIZE_COLORS[product.size] || "bg-gray-100"}
                    >
                      Size {product.size}
                    </Badge>
                  </div>
                  {product.itemCode && (
                    <div className="flex items-center gap-2 text-xs">
                      <Tag className="w-3 h-3" />
                      <span>Item Code: {product.itemCode}</span>
                    </div>
                  )}
                  {product.hsnCode && (
                    <div className="flex items-center gap-2 text-xs">
                      <Hash className="w-3 h-3" />
                      <span>HSN: {product.hsnCode}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {/* Stock Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Stock:
                  </span>
                  <Badge className={getStockBadgeColor(product.quantity)}>
                    {product.quantity} units
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Percent className="w-4 h-4 text-gray-400" />
                  <span>Sales Tax: {product.salesTax}</span>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">B2B</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {formatCurrency(product.b2bSalePrice)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">B2C</p>
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(product.b2cSalePrice)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Purchase</p>
                    <p className="text-sm font-semibold text-gray-600">
                      {formatCurrency(product.purchasePrice)}
                    </p>
                  </div>
                </div>

                {product.shortDescription && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 min-h-[32px]">
                    {product.shortDescription}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Added:{" "}
                  {product.createdAt &&
                  !isNaN(new Date(product.createdAt).getTime())
                    ? format(new Date(product.createdAt), "dd MMM yyyy")
                    : "N/A"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center mt-auto border-t pt-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsStockDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  disabled={product.status === "Inactive"}
                >
                  <Box className="w-4 h-4 mr-1" />
                  Stock
                </Button>
                <div className="flex space-x-2">
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
                  <Button
                    variant={
                      product.status === "Active" ? "destructive" : "default"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsStatusDialogOpen(true);
                    }}
                    className={`cursor-pointer ${
                      product.status === "Inactive"
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }`}
                  >
                    {product.status === "Active" ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-1" />
                        Inactive
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-center relative gap-4">
          {/* Pagination (Always Centered) */}
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
                hsnCode: selectedProduct.hsnCode,
                salesTax: selectedProduct.salesTax,
                shortDescription: selectedProduct.shortDescription,
                b2bSalePrice: selectedProduct.b2bSalePrice,
                b2cSalePrice: selectedProduct.b2cSalePrice,
                purchasePrice: selectedProduct.purchasePrice,
                status: selectedProduct.status,
              }}
              onSubmit={handleUpdateProduct}
              isLoading={isLoading}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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
                fetchProducts();
                fetchStockSummary();
                fetchLowStockCount();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedProduct?.status === "Active"
                ? "Deactivate Product?"
                : "Activate Product?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct?.status === "Active"
                ? "This product will be hidden from active inventory and cannot be used in transactions."
                : "This product will be visible in active inventory and can be used in transactions."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProduct(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              className={
                selectedProduct?.status === "Active"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {selectedProduct?.status === "Active" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
