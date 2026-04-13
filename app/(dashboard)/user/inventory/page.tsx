"use client";

import { useState, useEffect } from "react";
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
  Package,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Power,
  AlertTriangle,
  Box,
  Download,
} from "lucide-react";
import {
  getProducts,
  Product,
  deleteProduct,
  ProductFormData,
  updateProduct,
  createProduct,
  exportProductsToCSV,
} from "@/lib/api/products";
import ProductForm from "@/components/forms/ProductForm";
import toast from "react-hot-toast";
import InventorySkeleton from "@/components/skeletons/InventorySkeleton";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products based on search term, category, and stock status
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchLower) ||
          product.barCode.toLowerCase().includes(searchLower) ||
          product.itemCode?.toLowerCase().includes(searchLower),
      );
    }

    // Category filter - use productName or a separate category field
    // Since category doesn't exist in Product interface, we'll skip this filter or use a different approach
    // For now, we'll remove category filter or you can add a category field to your Product interface
    // if (categoryFilter !== "all") {
    //   filtered = filtered.filter(
    //     (product) => product.category === categoryFilter
    //   );
    // }

    // Stock status filter
    if (stockStatusFilter !== "all") {
      if (stockStatusFilter === "low") {
        filtered = filtered.filter(
          (product) => product.quantity <= 5 && product.quantity > 0,
        );
      } else if (stockStatusFilter === "out") {
        filtered = filtered.filter((product) => product.quantity === 0);
      } else if (stockStatusFilter === "in") {
        filtered = filtered.filter((product) => product.quantity > 0);
      }
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products, stockStatusFilter]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts("All");
      if (response.success && response.data) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories from products (using productName as fallback or you can add category field)
  // Since category doesn't exist, we'll create categories from first word of product name or skip
  const categories = ["all"];

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setShowProductDialog(true);
  };

  // Handle view product details
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setShowProductDialog(true);
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteProduct(productToDelete._id);
      if (response.success) {
        toast.success("Product deleted successfully");
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        loadProducts();
      } else {
        toast.error(response.message || "Failed to delete product");
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle create new product
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setShowProductDialog(true);
  };

  const handleProductSubmit = async (data: ProductFormData) => {
    try {
      if (isEditMode && selectedProduct) {
        // Update existing product - remove quantity for edit mode
        const { quantity, ...updateData } = data;
        const response = await updateProduct(selectedProduct._id, updateData);
        if (response.success) {
          toast.success("Product updated successfully!");
          await loadProducts();
          setShowProductDialog(false);
          setSelectedProduct(null);
          setIsEditMode(false);
        } else {
          toast.error(response.message || "Failed to update product");
        }
      } else {
        // Create new product
        const response = await createProduct(data);
        if (response.success) {
          toast.success("Product created successfully!");
          await loadProducts();
          setShowProductDialog(false);
        } else {
          toast.error(response.message || "Failed to create product");
        }
      }
    } catch (error: any) {
      console.error("Product submit error:", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  // Get stock status badge
  const getStockStatusBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          Out of Stock
        </Badge>
      );
    } else if (quantity <= 5) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Low Stock ({quantity})
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          In Stock ({quantity})
        </Badge>
      );
    }
  };

  // Handle export products to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await exportProductsToCSV();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Set filename with current date
      const date = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `products_inventory_${date}.csv`);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      toast.success("Products exported successfully");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.message || "Failed to export products");
    } finally {
      setIsExporting(false);
    }
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

  // Calculate low stock count
  const lowStockCount = products.filter(
    (p) => p.quantity <= 5 && p.quantity > 0,
  ).length;

  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const inStockCount = products.filter((p) => p.quantity > 0).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Inventory Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your products and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            disabled={isExporting || products.length === 0}
            className="cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>
          <Button onClick={handleCreateProduct} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-2xl font-bold">
                  {products.reduce((sum, p) => sum + p.quantity, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Box className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
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
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Stock Products</p>
                <p className="text-2xl font-bold text-green-600">
                  {inStockCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Power className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, barcode, or item code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={stockStatusFilter}
              onValueChange={setStockStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="in">In Stock</SelectItem>
                <SelectItem value="low">Low Stock (≤ 5)</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadProducts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Product List</CardTitle>
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <InventorySkeleton rows={6} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg mb-2">No products found</p>
              <p className="text-sm">
                {searchTerm || stockStatusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Click 'Add New Product' to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">
                        Purchase Price
                      </TableHead>
                      <TableHead className="text-right">B2B Price</TableHead>
                      <TableHead className="text-right">MRP</TableHead>
                      <TableHead className="text-right">Tax %</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      {/* <TableHead className="text-right">Action</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="max-w-[200px]">
                          <div className="min-w-0">
                            <p
                              className="font-medium truncate"
                              title={product.productName}
                            >
                              {product.productName}
                            </p>
                            {product.color && (
                              <p className="text-xs text-gray-500">
                                Color: {product.color}
                              </p>
                            )}
                            {product.size && (
                              <p className="text-xs text-gray-500">
                                Size: {product.size}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.barCode}
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-[120px] truncate">
                          {product.itemCode || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {product.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.purchasePrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.b2bSalePrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.b2cSalePrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.salesTax || product.purchaseTax || 0}%
                        </TableCell>
                        <TableCell className="text-center">
                          {getStockStatusBadge(product.quantity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewProduct(product)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button> */}
                            {/* <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditProduct(product)}
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setProductToDelete(product);
                                setShowDeleteConfirm(true);
                              }}
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
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
                    {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
                    {filteredProducts.length} entries
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
      </Card>

      {/* Product Form Dialog (Create/Edit) */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? selectedProduct
                  ? "Edit Product"
                  : "Add New Product"
                : "Product Details"}
            </DialogTitle>
          </DialogHeader>
          {showProductDialog && (
            <ProductForm
              initialData={selectedProduct || undefined}
              onSubmit={handleProductSubmit}
              isLoading={false}
              onCancel={() => setShowProductDialog(false)}
              isEditMode={isEditMode}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {productToDelete?.productName}
              </span>
              ? This action cannot be undone.
            </p>
            {productToDelete && productToDelete.quantity > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Warning: This product has {productToDelete.quantity} units
                  in stock. Deleting it will remove it from inventory history.
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
