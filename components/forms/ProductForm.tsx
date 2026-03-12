"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { SearchSelect } from "../ui/search-select";
import {
  Package,
  Barcode,
  Hash,
  Percent,
  Tag,
  FileText,
  IndianRupee,
  Palette,
  Ruler,
  Box,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Size options
const SIZE_OPTIONS = [
  { value: "XXXS", label: "Triple Extra Small (XXXS)" },
  { value: "XXS", label: "Double Extra Small (XXS)" },
  { value: "XS", label: "Extra Small (XS)" },
  { value: "S", label: "Small (S)" },
  { value: "M", label: "Medium (M)" },
  { value: "L", label: "Large (L)" },
  { value: "XL", label: "Extra Large (XL)" },
  { value: "XXL", label: "Double Extra Large (XXL)" },
  { value: "XXXL", label: "Triple Extra Large (XXXL)" },
  { value: "4XL", label: "Quadruple Extra Large (4XL)" },
  { value: "5XL", label: "Quintuple Extra Large (5XL)" },
  { value: "6XL", label: "Sextuple Extra Large (6XL)" },
  { value: "7XL", label: "Septuple Extra Large (7XL)" },
  { value: "8XL", label: "Octuple Extra Large (8XL)" },
  { value: "9XL", label: "Nonuple Extra Large (9XL)" },
  { value: "10XL", label: "Decuple Extra Large (10XL)" },
  { value: "FREE", label: "Free Size" },
  { value: "CUSTOM", label: "Custom Size" },
];

// Define the product schema
const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  itemCode: z.string().optional().default(""),
  barCode: z.string().min(1, "Barcode is required"),
  color: z.string().min(1, "Color is required"),
  size: z.enum([
    "XXXS",
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "4XL",
    "5XL",
    "6XL",
    "7XL",
    "8XL",
    "9XL",
    "10XL",
    "FREE",
    "CUSTOM",
  ]),
  quantity: z.coerce
    .number()
    .min(0, "Quantity cannot be negative")
    .optional()
    .default(0),
  hsnCode: z.string().optional().default(""),
  salesTax: z.coerce.number().min(0, "Sales tax must be a positive number"),
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
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: {
      productName: initialData?.productName || "",
      itemCode: initialData?.itemCode || "",
      barCode: initialData?.barCode || "",
      color: initialData?.color || "",
      size: initialData?.size || "M",
      quantity: initialData?.quantity || 0,
      hsnCode: initialData?.hsnCode || "",
      salesTax: initialData?.salesTax || 0,
      shortDescription: initialData?.shortDescription || "",
      b2bSalePrice: initialData?.b2bSalePrice || 0,
      b2cSalePrice: initialData?.b2cSalePrice || 0,
      purchasePrice: initialData?.purchasePrice || 0,
    },
  });

  const handleFormSubmit = (data: ProductFormData) => {
    // If in edit mode, remove quantity from the data before submitting
    if (isEditMode) {
      const { quantity, ...restData } = data;
      onSubmit(restData as ProductFormData);
    } else {
      onSubmit(data);
    }
  };

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

          {/* Item Code */}
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

          {/* Barcode */}
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

          {/* Color */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Color *
            </label>
            <div className="relative">
              <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("color")}
                error={errors.color?.message}
                placeholder="Enter color (e.g., Red, Blue, Black)"
                className="pl-10"
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size *
            </label>

            <Controller
              name="size"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="cursor-pointer w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>

                  <SelectContent>
                    {SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.size && (
              <p className="text-sm text-red-500 mt-1">{errors.size.message}</p>
            )}
          </div>

          {/* Quantity - Disabled in edit mode */}
          {/* <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {isEditMode ? "Current Quantity" : "Initial Quantity"}
            </label>
            <div className="relative">
              <Box className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                min="0"
                step="1"
                {...register("quantity")}
                error={errors.quantity?.message}
                placeholder={
                  isEditMode
                    ? "Manage stock via Stock Manager"
                    : "Enter initial quantity"
                }
                className={`pl-10 ${
                  isEditMode ? "bg-gray-50 text-gray-500" : ""
                }`}
                disabled={isEditMode}
              />
            </div>
            {isEditMode ? (
              <p className="text-xs text-blue-600 mt-1">
                Use the Supplier Invoice to update quantity for existing
                products.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Leave as 0 to create product without stock
              </p>
            )}
          </div> */}

          {/* HSN Code */}
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

          {/* Sales Tax */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sales Tax *
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                step="0.01"
                {...register("salesTax")}
                error={errors.salesTax?.message}
                className="pl-10"
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
              B2B Sale Price *
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
              />
            </div>
          </div>

          {/* B2C Price */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              B2C Sale Price *
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
              />
            </div>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Purchase Price *
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
              className="pl-10"
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
            className="cursor-pointer"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="cursor-pointer">
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
