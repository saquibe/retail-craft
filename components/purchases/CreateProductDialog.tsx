"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductForm from "@/components/forms/ProductForm";
import { createProduct } from "@/lib/api/products";
import toast from "react-hot-toast";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barcode: string;
  onProductCreated: () => void;
}

export default function CreateProductDialog({
  open,
  onOpenChange,
  barcode,
  onProductCreated,
}: CreateProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProduct = async (data: any) => {
    setIsLoading(true);
    try {
      // Ensure barcode is set from scanned value
      const productData = {
        ...data,
        barCode: barcode,
        // Set quantity to 0 as it will be added via purchase invoice
        quantity: 0,
      };

      const response = await createProduct(productData);
      if (response.success) {
        toast.success("Product created successfully!");
        onOpenChange(false);
        onProductCreated();
      }
    } catch (error: any) {
      console.error("Create product error:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product (Barcode: {barcode})</DialogTitle>
        </DialogHeader>
        <ProductForm
          initialData={{ barCode: barcode }}
          onSubmit={handleCreateProduct}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
          isEditMode={false}
        />
      </DialogContent>
    </Dialog>
  );
}
