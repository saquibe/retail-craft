"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { addStock, reduceStock } from "@/lib/api/products";
import { Plus, Minus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface StockManagerProps {
  productId: string;
  productName: string;
  currentStock: number;
  onStockUpdate?: () => void;
}

export function StockManager({
  productId,
  productName,
  currentStock,
  onStockUpdate,
}: StockManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReduceDialogOpen, setIsReduceDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [operationLoading, setOperationLoading] = useState(false);

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
        quantity,
      });

      if (response.success) {
        toast.success(`Added ${quantity} units to ${productName}`);
        setIsAddDialogOpen(false);
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

    if (quantity > currentStock) {
      toast.error(`Insufficient stock. Only ${currentStock} available`);
      return;
    }

    setOperationLoading(true);
    try {
      const response = await reduceStock({
        productId,
        quantity,
      });

      if (response.success) {
        toast.success(`Reduced ${quantity} units from ${productName}`);
        setIsReduceDialogOpen(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stock Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Current Stock</p>
          <p className="text-4xl font-bold text-blue-600">{currentStock}</p>
          <p className="text-xs text-gray-400 mt-1">units</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
          <Button
            onClick={() => setIsReduceDialogOpen(true)}
            variant="destructive"
            disabled={currentStock === 0}
          >
            <Minus className="w-4 h-4 mr-2" />
            Reduce Stock
          </Button>
        </div>
      </CardContent>

      {/* Add Stock Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stock - {productName}</DialogTitle>
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
                  Current stock: <strong>{currentStock}</strong> units
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  After add: <strong>{currentStock + quantity}</strong> units
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} disabled={operationLoading}>
              {operationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Stock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reduce Stock Dialog */}
      <Dialog open={isReduceDialogOpen} onOpenChange={setIsReduceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reduce Stock - {productName}</DialogTitle>
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
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Current stock: <strong>{currentStock}</strong> units
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  After reduce: <strong>{currentStock - quantity}</strong> units
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
              {operationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reducing...
                </>
              ) : (
                "Reduce Stock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
