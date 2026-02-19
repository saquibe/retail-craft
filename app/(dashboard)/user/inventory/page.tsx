"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getAllInventory,
  getStockSummary,
  getLowStock,
  InventoryItem,
  LowStockItem,
} from "@/lib/api/inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StockManager } from "@/components/inventory/StockManager";
import {
  Search,
  Package,
  AlertTriangle,
  Box,
  Filter,
  Eye,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

// Size constants
export const SIZES = [
  { value: "S", label: "Small (S)" },
  { value: "M", label: "Medium (M)" },
  { value: "L", label: "Large (L)" },
  { value: "XL", label: "Extra Large (XL)" },
  { value: "XXL", label: "Double Extra Large (XXL)" },
];

interface GroupedInventory {
  productId: string;
  productName: string;
  barCode: string;
  stocks: Record<string, number>;
  totalStock: number;
  lowStockSizes: string[];
  outOfStockSizes: string[];
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<GroupedInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] =
    useState<GroupedInventory | null>(null);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [summary, setSummary] = useState({ totalProducts: 0, totalStock: 0 });
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    if (user?.branchId) {
      loadInventoryData();
      loadSummary();
      loadLowStockCount();
    }
  }, [user]);

  // =====================================================
  // GET /api/stocks - Get ALL inventory
  // =====================================================
  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      const response = await getAllInventory();

      if (response.success && response.data) {
        // Group inventory by product
        const groupedMap = new Map<string, GroupedInventory>();

        response.data.forEach((item: InventoryItem) => {
          if (!groupedMap.has(item.productId)) {
            groupedMap.set(item.productId, {
              productId: item.productId,
              productName: item.productName,
              barCode: item.barCode,
              stocks: {},
              totalStock: 0,
              lowStockSizes: [],
              outOfStockSizes: [],
            });
          }

          const group = groupedMap.get(item.productId)!;
          group.stocks[item.size] = item.quantity;
          group.totalStock += item.quantity;

          // Track low stock (<=5) and out of stock
          if (item.quantity === 0) {
            group.outOfStockSizes.push(item.size);
          } else if (item.quantity <= 5) {
            group.lowStockSizes.push(item.size);
          }
        });

        setInventory(Array.from(groupedMap.values()));
      }
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // GET /api/stocks/summary - Get stock summary
  // =====================================================
  const loadSummary = async () => {
    try {
      const response = await getStockSummary();
      if (response.success) {
        setSummary({
          totalProducts: response.totalProducts,
          totalStock: response.totalStock,
        });
      }
    } catch (error) {
      console.error("Error loading summary:", error);
    }
  };

  // =====================================================
  // GET /api/stocks/low-stock - Get low stock count
  // =====================================================
  const loadLowStockCount = async () => {
    try {
      const response = await getLowStock();
      if (response.success) {
        setLowStockCount(response.data.length);
      }
    } catch (error) {
      console.error("Error loading low stock:", error);
    }
  };

  // Filter products
  const filteredInventory = inventory.filter((item) => {
    // Search filter
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Size filter
    if (sizeFilter !== "all") {
      const hasSize = item.stocks[sizeFilter] !== undefined;
      if (!hasSize) return false;
    }

    // Stock status filter
    if (stockFilter === "low") {
      return item.lowStockSizes.length > 0;
    }
    if (stockFilter === "out") {
      return item.outOfStockSizes.length > 0;
    }
    if (stockFilter === "in") {
      return item.totalStock > 0 && item.lowStockSizes.length === 0;
    }

    return true;
  });

  // Get stock badge color
  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return "bg-gray-100 text-gray-400";
    if (stock <= 5) return "bg-red-100 text-red-800";
    if (stock <= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-gray-500">Track stock across all sizes</p>
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
                <p className="text-3xl font-bold">{summary.totalProducts}</p>
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
                <p className="text-3xl font-bold">{summary.totalStock}</p>
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
                  Active Items
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {inventory.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock by Product</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No inventory found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm || sizeFilter !== "all" || stockFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add products to see inventory"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead className="text-center">S/M/L/XL/XXL</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>{item.barCode}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {SIZES.map((size) => {
                          const stock = item.stocks[size.value] || 0;
                          const badgeColor = getStockBadgeColor(stock);

                          return (
                            <Badge
                              key={size.value}
                              className={`${badgeColor} px-2 py-1`}
                            >
                              {size.value}:{stock}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {item.totalStock}
                    </TableCell>
                    <TableCell>
                      {item.lowStockSizes.length > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800 mr-1">
                          Low: {item.lowStockSizes.join(", ")}
                        </Badge>
                      )}
                      {item.outOfStockSizes.length > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          Out: {item.outOfStockSizes.join(", ")}
                        </Badge>
                      )}
                      {item.lowStockSizes.length === 0 &&
                        item.outOfStockSizes.length === 0 &&
                        item.totalStock > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            In Stock
                          </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsStockDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stock Management Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Stock Management - {selectedProduct?.productName}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && user?.branchId && (
            <StockManager
              productId={selectedProduct.productId}
              productName={selectedProduct.productName}
              branchId={user.branchId}
              sizes={["S", "M", "L", "XL", "XXL"]}
              onStockUpdate={() => {
                loadInventoryData();
                loadSummary();
                loadLowStockCount();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
