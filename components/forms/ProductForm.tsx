// components/forms/ProductForm.tsx - Update the form component

"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Percent, FileText, IndianRupee, Loader2 } from "lucide-react";

// Define the product schema
const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  itemCode: z.string().min(1, "Item code is required"),
  barCode: z.string().regex(/^\d+$/, "Barcode must be numeric"),
  color: z.string().min(1, "Color is required"),
  size: z.string().min(1, "Size is required"),
  quantity: z.coerce
    .number()
    .min(0, "Quantity cannot be negative")
    .optional()
    .default(0),
  hsnCode: z.string().min(1, "HSN code is required"),
  salesTax: z.coerce.number().min(0, "Sales tax must be a positive number"),
  purchaseTax: z.coerce
    .number()
    .min(0, "Purchase tax must be a positive number"),
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
  isEditMode?: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
  isEditMode = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: {
      productName: initialData?.productName || "",
      itemCode: initialData?.itemCode || "",
      barCode: initialData?.barCode || "",
      color: initialData?.color || "",
      size: initialData?.size || "",
      quantity: initialData?.quantity || 0,
      hsnCode: initialData?.hsnCode || "",
      salesTax: initialData?.salesTax || 0,
      purchaseTax: initialData?.purchaseTax || 0,
      shortDescription: initialData?.shortDescription || "",
      b2bSalePrice: initialData?.b2bSalePrice || 0,
      b2cSalePrice: initialData?.b2cSalePrice || 0,
      purchasePrice: initialData?.purchasePrice || 0,
    },
  });

  const handleFormSubmit = async (data: ProductFormData) => {
    // If in edit mode, remove quantity from the data before submitting
    if (isEditMode) {
      const { quantity, ...restData } = data;
      await onSubmit(restData as ProductFormData);
    } else {
      await onSubmit(data);
    }
  };

  const isButtonDisabled = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Product Name *
            </label>
            <Input
              {...register("productName")}
              error={errors.productName?.message}
              placeholder="Enter product name"
              disabled={isButtonDisabled}
            />
          </div>

          {/* Item Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Item Code *
            </label>
            <Input
              {...register("itemCode")}
              error={errors.itemCode?.message}
              placeholder="Enter item code"
              disabled={isButtonDisabled}
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Barcode *
            </label>
            <Input
              type="number"
              {...register("barCode")}
              error={errors.barCode?.message}
              placeholder="Enter barcode"
              disabled={isButtonDisabled}
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Color *
            </label>
            <Input
              {...register("color")}
              error={errors.color?.message}
              placeholder="Enter color (e.g., Red, Blue, Black)"
              disabled={isButtonDisabled}
            />
          </div>

          {/* Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Size *
            </label>
            <Input
              {...register("size")}
              error={errors.size?.message}
              placeholder="Enter size (e.g., M, XL, 42, Custom)"
              disabled={isButtonDisabled}
            />
          </div>

          {/* HSN Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              HSN Code *
            </label>
            <Input
              {...register("hsnCode")}
              error={errors.hsnCode?.message}
              placeholder="Enter HSN code"
              disabled={isButtonDisabled}
            />
          </div>

          {/* Sales Tax */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sales Tax (%) *
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("salesTax")}
                error={errors.salesTax?.message}
                placeholder="Enter sales tax percentage"
                className="pl-10"
                disabled={isButtonDisabled}
              />
            </div>
          </div>

          {/* Purchase Tax */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Purchase Tax (%) *
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("purchaseTax")}
                error={errors.purchaseTax?.message}
                placeholder="Enter purchase tax percentage"
                className="pl-10"
                disabled={isButtonDisabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* B2B Price */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              B2B Sale Price (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("b2bSalePrice")}
                error={errors.b2bSalePrice?.message}
                placeholder="0.00"
                className="pl-10"
                disabled={isButtonDisabled || isEditMode}
              />
            </div>
          </div>

          {/* B2C Price */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              MRP (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("b2cSalePrice")}
                error={errors.b2cSalePrice?.message}
                placeholder="0.00"
                className="pl-10"
                disabled={isButtonDisabled || isEditMode}
              />
            </div>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Purchase Price (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("purchasePrice")}
                error={errors.purchasePrice?.message}
                placeholder="0.00"
                className="pl-10"
                disabled={isButtonDisabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
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
              disabled={isButtonDisabled}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isButtonDisabled}
            className="cursor-pointer"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isButtonDisabled}
          className="cursor-pointer min-w-[120px]"
        >
          {isButtonDisabled ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditMode ? "Update Product" : "Create Product"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
