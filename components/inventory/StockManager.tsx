"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getProductInventory,
  addStock,
  reduceStock,
  ProductInventory,
} from "@/lib/api/inventory";
import { Plus, Minus, RefreshCw, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface StockManagerProps {
  productId: string;
  productName: string;
  branchId: string;
  sizes: string[];
  onStockUpdate?: () => void;
}

// Size colors for visual distinction
const SIZE_COLORS: Record<string, string> = {
  S: "bg-blue-100 text-blue-800",
  M: "bg-green-100 text-green-800",
  L: "bg-yellow-100 text-yellow-800",
  XL: "bg-purple-100 text-purple-800",
  XXL: "bg-red-100 text-red-800",
};

export function StockManager({
  productId,
  productName,
  branchId,
  sizes,
  onStockUpdate,
}: StockManagerProps) {
  const [inventory, setInventory] = useState<
    { size: string; quantity: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || "M");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReduceDialogOpen, setIsReduceDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  // Load inventory for this product
  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const response = await getProductInventory(productId);
      console.log("Product inventory response:", response);

      if (response.success && response.inventory) {
        setInventory(response.inventory);
      } else {
        toast.error("Failed to load inventory");
      }
    } catch (error: any) {
      console.error("Error loading inventory:", error);
      toast.error(error.response?.data?.message || "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadInventory();
    }
  }, [productId]);

  // Get stock for a specific size
  const getStockForSize = (size: string) => {
    const item = inventory.find((i) => i.size === size);
    return item?.quantity || 0;
  };

  // Handle add stock
  const handleAddStock = async () => {
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setOperationLoading(true);
    try {
      const response = await addStock({
        productId,
        size: selectedSize as any,
        quantity,
      });

      if (response.success) {
        toast.success(`Added ${quantity} units to size ${selectedSize}`);
        setIsAddDialogOpen(false);
        await loadInventory();
        onStockUpdate?.();
        setQuantity(1);
      } else {
        toast.error(response.message || "Failed to add stock");
      }
    } catch (error: any) {
      console.error("Add stock error:", error);
      toast.error(error.response?.data?.message || "Failed to add stock");
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle reduce stock
  const handleReduceStock = async () => {
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const currentStock = getStockForSize(selectedSize);
    if (quantity > currentStock) {
      toast.error(`Insufficient stock. Only ${currentStock} available`);
      return;
    }

    setOperationLoading(true);
    try {
      const response = await reduceStock({
        productId,
        size: selectedSize as any,
        quantity,
      });

      if (response.success) {
        toast.success(`Reduced ${quantity} units from size ${selectedSize}`);
        setIsReduceDialogOpen(false);
        await loadInventory();
        onStockUpdate?.();
        setQuantity(1);
      } else {
        toast.error(response.message || "Failed to reduce stock");
      }
    } catch (error: any) {
      console.error("Reduce stock error:", error);
      toast.error(error.response?.data?.message || "Failed to reduce stock");
    } finally {
      setOperationLoading(false);
    }
  };

  // Check if any size is low stock (<=5)
  const lowStockSizes = inventory.filter(
    (i) => i.quantity > 0 && i.quantity <= 5,
  );
  const outOfStockSizes = inventory.filter((i) => i.quantity === 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Stock Management</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{productName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadInventory}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Alerts */}
        {(lowStockSizes.length > 0 || outOfStockSizes.length > 0) && (
          <div className="mt-4 space-y-2">
            {outOfStockSizes.map((item) => (
              <div
                key={item.size}
                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Size {item.size} is out of stock!</span>
              </div>
            ))}
            {lowStockSizes.map((item) => (
              <div
                key={item.size}
                className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Size {item.size} is low on stock ({item.quantity} left)
                </span>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stock Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.map((size) => {
                  const stock = getStockForSize(size);
                  let statusColor = "bg-gray-100 text-gray-800";
                  let statusText = "No Stock";

                  if (stock > 10) {
                    statusColor = "bg-green-100 text-green-800";
                    statusText = "Good Stock";
                  } else if (stock > 0 && stock <= 5) {
                    statusColor = "bg-yellow-100 text-yellow-800";
                    statusText = "Low Stock";
                  } else if (stock > 5 && stock <= 10) {
                    statusColor = "bg-blue-100 text-blue-800";
                    statusText = "Limited";
                  } else if (stock > 0) {
                    statusColor = "bg-green-100 text-green-800";
                    statusText = "In Stock";
                  }

                  return (
                    <TableRow key={size}>
                      <TableCell>
                        <Badge className={SIZE_COLORS[size] || "bg-gray-100"}>
                          Size {size}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {stock}
                      </TableCell>
                      <TableCell className="text-right">
                        {stock > 0 ? (
                          <Badge className={statusColor}>{statusText}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Out of Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSize(size);
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSize(size);
                              setIsReduceDialogOpen(true);
                            }}
                            disabled={stock === 0}
                          >
                            <Minus className="w-4 h-4 mr-1" />
                            Reduce
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Total Stock Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Total All Sizes:
                </span>
                <span className="text-xl font-bold">
                  {inventory.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  units
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Add Stock Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stock - Size {selectedSize}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quantity to Add
                </label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Current stock:{" "}
                  <strong>{getStockForSize(selectedSize)}</strong> units
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  After add:{" "}
                  <strong>{getStockForSize(selectedSize) + quantity}</strong>{" "}
                  units
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} disabled={operationLoading}>
              {operationLoading ? "Adding..." : "Add Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reduce Stock Dialog */}
      <Dialog open={isReduceDialogOpen} onOpenChange={setIsReduceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reduce Stock - Size {selectedSize}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quantity to Reduce
                </label>
                <Input
                  type="number"
                  min="1"
                  max={getStockForSize(selectedSize)}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Current stock:{" "}
                  <strong>{getStockForSize(selectedSize)}</strong> units
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  After reduce:{" "}
                  <strong>
                    {Math.max(0, getStockForSize(selectedSize) - quantity)}
                  </strong>{" "}
                  units
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReduceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReduceStock}
              disabled={operationLoading}
              variant="destructive"
            >
              {operationLoading ? "Reducing..." : "Reduce Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
