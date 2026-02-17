"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

const productSchema = z.object({
  itemCode: z.string().optional(),
  barcode: z.string().min(1, "Barcode is required"),
  productName: z.string().min(1, "Product name is required"),
  unit: z.string().min(1, "Unit is required"),
  hsnCode: z.string().optional(),
  salesTax: z.string().min(1, "Sales tax is required"),
  shortDescription: z.string().optional(),
  b2bSalePrice: z.string().min(1, "B2B sale price is required"),
  b2cSalePrice: z.string().min(1, "B2C sale price is required"),
  purchasePrice: z.string().min(1, "Purchase price is required"),
});

export default function ProductForm({ initialData, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Item Code"
          {...register("itemCode")}
          error={errors.itemCode?.message}
        />

        <Input
          label="Barcode *"
          {...register("barcode")}
          error={errors.barcode?.message}
        />

        <Input
          label="Product Name *"
          {...register("productName")}
          error={errors.productName?.message}
        />

        <Input
          label="Unit *"
          {...register("unit")}
          error={errors.unit?.message}
          placeholder="e.g., Pcs, Kg, Box"
        />

        <Input
          label="HSN Code"
          {...register("hsnCode")}
          error={errors.hsnCode?.message}
        />

        <Input
          label="Sales Tax (%) *"
          type="number"
          step="0.01"
          {...register("salesTax")}
          error={errors.salesTax?.message}
        />

        <Input
          label="B2B Sale Price *"
          type="number"
          step="0.01"
          {...register("b2bSalePrice")}
          error={errors.b2bSalePrice?.message}
        />

        <Input
          label="B2C Sale Price *"
          type="number"
          step="0.01"
          {...register("b2cSalePrice")}
          error={errors.b2cSalePrice?.message}
        />

        <Input
          label="Purchase Price *"
          type="number"
          step="0.01"
          {...register("purchasePrice")}
          error={errors.purchasePrice?.message}
        />
      </div>

      <Textarea
        label="Short Description"
        {...register("shortDescription")}
        error={errors.shortDescription?.message}
        rows={3}
      />

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update" : "Create"} Product
        </Button>
      </div>
    </form>
  );
}
