"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
  CreateProductData, // Use CreateProductData instead
} from "@/lib/api/products";
import ProductForm, { ProductFormData } from "@/components/forms/ProductForm"; // Import from form
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
  Barcode,
  DollarSign,
  Tag,
  Hash,
  Percent,
  Scale,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getProducts();
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter((product) => {
    return (
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle create product
  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      const response = await createProduct(data);
      if (response.success) {
        toast.success("Product created successfully!");
        setIsCreateOpen(false);
        fetchProducts();
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

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const response = await deleteProduct(selectedProduct._id);
      if (response.success) {
        toast.success("Product deleted successfully!");
        setIsDeleteOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error: any) {
      console.error("Delete product error:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500">Manage your product inventory</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search products by name, barcode, item code, or HSN code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">
                      {product.productName}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Barcode className="w-3 h-3" />
                    <span className="font-mono">
                      Barcode: {product.barCode}
                    </span>
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
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Scale className="w-4 h-4 text-gray-400" />
                  <span>Unit: {product.unit}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Percent className="w-4 h-4 text-gray-400" />
                  <span>Sales Tax: {product.salesTax}</span>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">B2B Price</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {formatCurrency(product.b2bSalePrice)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">B2C Price</p>
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
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                    {product.shortDescription}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Added: {format(new Date(product.createdAt), "dd MMM yyyy")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsEditOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
                unit: selectedProduct.unit,
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
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
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
    </div>
  );
}
