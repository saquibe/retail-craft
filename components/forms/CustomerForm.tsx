"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SearchSelect } from "../ui/search-select";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Country, State, City } from "country-state-city";
import { Building2, User, Mail, Phone, Briefcase } from "lucide-react";

// Get all countries
const countries = Country.getAllCountries().map((country) => ({
  value: country.name,
  label: country.name,
  isoCode: country.isoCode,
}));

// Base schema for common fields
const baseCustomerSchema = {
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile must be 10 digits")
    .optional()
    .or(z.literal("")),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
};

// B2B specific schema
const b2bSchema = z.object({
  customerType: z.literal("B2B"),
  ...baseCustomerSchema,
  companyName: z.string().min(1, "Company name is required"),
  GstRegistrationType: z.string().min(1, "GST registration type is required"),
  gstIn: z.string().min(1, "GST number is required"),
  contactName: z.string().optional(),
  contactNumber: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be 10 digits")
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .email("Invalid contact email")
    .optional()
    .or(z.literal("")),
});

// B2C specific schema
const b2cSchema = z.object({
  customerType: z.literal("B2C"),
  ...baseCustomerSchema,
});

// Combined schema with discriminated union
const customerSchema = z.discriminatedUnion("customerType", [
  b2bSchema,
  b2cSchema,
]);

export type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void> | void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function CustomerForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: CustomerFormProps) {
  const [customerType, setCustomerType] = useState<"B2B" | "B2C">(
    initialData?.customerType || "B2C",
  );
  // Narrowed view for B2B-specific initial fields
  const b2bInitial = initialData as
    | Partial<z.infer<typeof b2bSchema>>
    | undefined;
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerType: customerType,
      name: initialData?.name || "",
      email: initialData?.email || "",
      mobile: initialData?.mobile || "",
      country: initialData?.country || "",
      state: initialData?.state || "",
      city: initialData?.city || "",
      ...(customerType === "B2B" && {
        companyName: b2bInitial?.companyName || "",
        GstRegistrationType: b2bInitial?.GstRegistrationType || "",
        gstIn: b2bInitial?.gstIn || "",
        contactName: b2bInitial?.contactName || "",
        contactNumber: b2bInitial?.contactNumber || "",
        contactEmail: b2bInitial?.contactEmail || "",
      }),
    },
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Update customer type when tab changes
  useEffect(() => {
    setValue("customerType", customerType);
  }, [customerType, setValue]);

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === selectedCountry,
      );

      if (!countryObj) return;

      const countryStates = State.getStatesOfCountry(countryObj.isoCode).map(
        (state) => ({
          value: state.name,
          label: state.name,
          isoCode: state.isoCode,
        }),
      );

      setStates(countryStates);

      if (!initialData?.country || initialData.country !== selectedCountry) {
        setValue("state", "");
        setValue("city", "");
        setCities([]);
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountry, setValue, initialData]);

  // Update cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === selectedCountry,
      );

      if (!countryObj) return;

      const stateObj = State.getStatesOfCountry(countryObj.isoCode).find(
        (s) => s.name === selectedState,
      );

      if (!stateObj) return;

      const stateCities = City.getCitiesOfState(
        countryObj.isoCode,
        stateObj.isoCode,
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));

      setCities(stateCities);

      if (!initialData?.city || initialData.state !== selectedState) {
        setValue("city", "");
      }
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState, setValue, initialData]);

  const handleFormSubmit = (data: CustomerFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Customer Type Tabs */}
      <Tabs
        value={customerType}
        onValueChange={(value) => setCustomerType(value as "B2B" | "B2C")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="B2C" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            B2C Customer
          </TabsTrigger>
          <TabsTrigger value="B2B" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            B2B Customer
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Hidden field for customerType */}
      <input type="hidden" {...register("customerType")} value={customerType} />

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Name with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Customer Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("name")}
                error={errors.name?.message}
                placeholder="Enter customer name"
                className="pl-10"
              />
            </div>
          </div>

          {/* Email with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="Enter email address"
                className="pl-10"
              />
            </div>
          </div>

          {/* Mobile with Icon */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Mobile
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("mobile")}
                error={errors.mobile?.message}
                placeholder="Enter 10 digit mobile number"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">
          Location Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="Country"
                options={countries}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select country"
                searchPlaceholder="Search country..."
                error={errors.country?.message}
                required
              />
            )}
          />

          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="State"
                options={states}
                value={field.value}
                onChange={field.onChange}
                placeholder={
                  selectedCountry ? "Select state" : "Select country first"
                }
                searchPlaceholder="Search state..."
                error={errors.state?.message}
                disabled={!selectedCountry}
                required
              />
            )}
          />

          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="City"
                options={cities}
                value={field.value}
                onChange={field.onChange}
                placeholder={
                  selectedState ? "Select city" : "Select state first"
                }
                searchPlaceholder="Search city..."
                error={errors.city?.message}
                disabled={!selectedState}
                required
              />
            )}
          />
        </div>
      </div>

      {/* B2B Specific Fields */}
      {customerType === "B2B" && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name with Icon */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Company Name *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  {...register("companyName")}
                  error={(errors as any).companyName?.message}
                  placeholder="Enter company name"
                  className="pl-10"
                />
              </div>
            </div>

            {/* GST Registration Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                GST Registration Type *
              </label>
              <Input
                {...register("GstRegistrationType")}
                error={(errors as any).GstRegistrationType?.message}
                placeholder="e.g., Regular, Composition"
              />
            </div>

            {/* GST Number */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                GST Number *
              </label>
              <Input
                {...register("gstIn")}
                error={(errors as any).gstIn?.message}
                placeholder="Enter GST number"
              />
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Contact Person Name
              </label>
              <Input
                {...register("contactName")}
                error={(errors as any).contactName?.message}
                placeholder="Enter contact person name"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Contact Number
              </label>
              <Input
                {...register("contactNumber")}
                error={(errors as any).contactNumber?.message}
                placeholder="Enter contact number"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Contact Email
              </label>
              <Input
                type="email"
                {...register("contactEmail")}
                error={(errors as any).contactEmail?.message}
                placeholder="Enter contact email"
              />
            </div>
          </div>
        </div>
      )}

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
            ? "Update Customer"
            : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
