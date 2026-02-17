"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

const baseCustomerSchema = {
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  mobileNo: z.string().min(10, "Mobile number must be 10 digits").max(10),
  panNo: z.string().optional(),
  telephoneNo: z.string().optional(),
  whatsAppNo: z.string().optional(),
  dateOfBirth: z.string().optional(),
  anniversaryDate: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),
};

const b2bSchema = z.object({
  ...baseCustomerSchema,
  customerType: z.literal("B2B"),
});

const b2cSchema = z.object({
  ...baseCustomerSchema,
  customerType: z.literal("B2C"),
  companyName: z.string().min(1, "Company name is required"),
  gstType: z.string().min(1, "GST type is required"),
  gstin: z.string().min(1, "GSTIN is required"),
  contactName: z.string().optional(),
  contactNo: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

const customerSchema = z.discriminatedUnion("customerType", [
  b2bSchema,
  b2cSchema,
]);

export default function CustomerForm({ initialData, onSubmit, isLoading }) {
  const [customerType, setCustomerType] = useState(
    initialData?.customerType || "B2B",
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { customerType, ...initialData },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Type
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="B2B"
              checked={customerType === "B2B"}
              onChange={(e) => setCustomerType(e.target.value)}
              className="form-radio"
            />
            <span className="ml-2">B2B</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="B2C"
              checked={customerType === "B2C"}
              onChange={(e) => setCustomerType(e.target.value)}
              className="form-radio"
            />
            <span className="ml-2">B2C</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Name *"
          {...register("name")}
          error={errors.name?.message}
        />

        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Mobile No. *"
          {...register("mobileNo")}
          error={errors.mobileNo?.message}
        />

        <Input
          label="PAN No."
          {...register("panNo")}
          error={errors.panNo?.message}
        />

        <Input
          label="Telephone No."
          {...register("telephoneNo")}
          error={errors.telephoneNo?.message}
        />

        <Input
          label="WhatsApp No."
          {...register("whatsAppNo")}
          error={errors.whatsAppNo?.message}
        />

        <Input
          label="Date of Birth"
          type="date"
          {...register("dateOfBirth")}
          error={errors.dateOfBirth?.message}
        />

        <Input
          label="Anniversary Date"
          type="date"
          {...register("anniversaryDate")}
          error={errors.anniversaryDate?.message}
        />

        <Input
          label="Address Line 1"
          {...register("addressLine1")}
          error={errors.addressLine1?.message}
          className="col-span-2"
        />

        <Input
          label="Address Line 2"
          {...register("addressLine2")}
          error={errors.addressLine2?.message}
          className="col-span-2"
        />

        <Input
          label="Country *"
          {...register("country")}
          error={errors.country?.message}
        />

        <Input
          label="State *"
          {...register("state")}
          error={errors.state?.message}
        />

        <Input
          label="City *"
          {...register("city")}
          error={errors.city?.message}
        />

        <Input
          label="Pincode *"
          {...register("pincode")}
          error={errors.pincode?.message}
        />
      </div>

      {customerType === "B2C" && (
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-4">
            B2C Additional Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              {...register("companyName")}
              error={errors.companyName?.message}
            />

            <Select
              label="GST Type *"
              {...register("gstType")}
              error={errors.gstType?.message}
              options={[
                { value: "registered", label: "Registered" },
                { value: "unregistered", label: "Unregistered" },
                { value: "composition", label: "Composition" },
              ]}
            />

            <Input
              label="GSTIN *"
              {...register("gstin")}
              error={errors.gstin?.message}
            />

            <Input
              label="Contact Name"
              {...register("contactName")}
              error={errors.contactName?.message}
            />

            <Input
              label="Contact No."
              {...register("contactNo")}
              error={errors.contactNo?.message}
            />

            <Input
              label="Contact Email"
              type="email"
              {...register("contactEmail")}
              error={errors.contactEmail?.message}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update" : "Create"} Customer
        </Button>
      </div>
    </form>
  );
}
