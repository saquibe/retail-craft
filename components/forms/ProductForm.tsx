"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Package,
  Barcode,
  Scale,
  Hash,
  Percent,
  DollarSign,
  Tag,
  FileText,
} from "lucide-react";

// Define the product schema with proper type coercion
const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  itemCode: z.string().optional().default(""),
  barCode: z.string().min(1, "Barcode is required"),
  unit: z.coerce.number().min(1, "Unit must be at least 1"),
  hsnCode: z.string().optional().default(""),
  salesTax: z.string().min(1, "Sales tax is required"),
  shortDescription: z.string().optional().default(""),
  b2bSalePrice: z.coerce.number().min(0, "Price must be a positive number"),
  b2cSalePrice: z.coerce.number().min(0, "Price must be a positive number"),
  purchasePrice: z.coerce.number().min(0, "Price must be a positive number"),
});

// Infer the type from the schema
export type ProductFormData = z.infer<typeof productSchema>;

// Define props interface
interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void> | void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: {
      productName: initialData?.productName || "",
      itemCode: initialData?.itemCode || "",
      barCode: initialData?.barCode || "",
      unit: initialData?.unit || 1,
      hsnCode: initialData?.hsnCode || "",
      salesTax: initialData?.salesTax || "",
      shortDescription: initialData?.shortDescription || "",
      b2bSalePrice: initialData?.b2bSalePrice || 0,
      b2cSalePrice: initialData?.b2cSalePrice || 0,
      purchasePrice: initialData?.purchasePrice || 0,
    },
  });

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Product Name *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("productName")}
                error={errors.productName?.message}
                placeholder="Enter product name"
                className="pl-10"
              />
            </div>
          </div>

          {/* Item Code with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Item Code
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("itemCode")}
                error={errors.itemCode?.message}
                placeholder="Enter item code (optional)"
                className="pl-10"
              />
            </div>
          </div>

          {/* Barcode with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Barcode *
            </label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("barCode")}
                error={errors.barCode?.message}
                placeholder="Enter barcode"
                className="pl-10"
              />
            </div>
          </div>

          {/* Unit with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Unit *
            </label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                {...register("unit")}
                error={errors.unit?.message}
                placeholder="Enter unit (e.g., 1, 5, 10)"
                className="pl-10"
              />
            </div>
          </div>

          {/* HSN Code with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              HSN Code
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("hsnCode")}
                error={errors.hsnCode?.message}
                placeholder="Enter HSN code (optional)"
                className="pl-10"
              />
            </div>
          </div>

          {/* Sales Tax with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sales Tax *
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("salesTax")}
                error={errors.salesTax?.message}
                placeholder="e.g., 18%, GST"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">
          Pricing Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* B2B Price with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              B2B Sale Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("b2bSalePrice")}
                error={errors.b2bSalePrice?.message}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>

          {/* B2C Price with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              B2C Sale Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("b2cSalePrice")}
                error={errors.b2cSalePrice?.message}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>

          {/* Purchase Price with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Purchase Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("purchasePrice")}
                error={errors.purchasePrice?.message}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">
          Additional Information
        </h3>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Short Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Textarea
              {...register("shortDescription")}
              error={errors.shortDescription?.message}
              placeholder="Enter a brief description of the product (optional)"
              rows={3}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Product"
            : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
