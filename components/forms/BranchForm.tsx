"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import moment from "moment-timezone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import CountryStateCitySelector from "../common/CountryStateCitySelector";

// Get all timezones
const timezones = moment.tz.names().map((tz) => ({
  value: tz,
  label: tz.replace(/_/g, " "),
}));

// Define the branch schema
const branchSchema = z.object({
  branchName: z.string().min(1, "Branch name is required"),
  branchPhoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),
  timeZone: z.string().min(1, "Time zone is required"),
  branchCode: z.string().min(1, "Branch code is required"),
  branchGstNumber: z.string().min(1, "GST number is required"),
});

// Infer the type from the schema
export type BranchFormData = z.infer<typeof branchSchema>;

// Define props interface
interface BranchFormProps {
  initialData?: Partial<BranchFormData>;
  onSubmit: (data: BranchFormData) => Promise<void> | void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function BranchForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: BranchFormProps) {
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  const methods = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: initialData || {},
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = methods;

  const timeZoneValue = watch("timeZone");

  // Check if location detection is complete
  useEffect(() => {
    // If we have initial data or timezone is already set, we don't need to show loading
    if (initialData?.timeZone || timeZoneValue) {
      setIsLocationLoading(false);
    }
  }, [initialData, timeZoneValue]);

  const handleFormSubmit = (data: BranchFormData) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Row 1: Branch Name and Branch Code */}
          <Input
            label="Branch Name"
            {...register("branchName")}
            error={errors.branchName?.message}
            id="branchName"
            placeholder="Enter branch name"
            required
          />

          <Input
            label="Branch Code"
            {...register("branchCode")}
            error={errors.branchCode?.message}
            id="branchCode"
            placeholder="Enter branch code"
            required
          />

          {/* Row 2: GST Number and Phone Number */}
          <Input
            label="GST Number"
            {...register("branchGstNumber")}
            error={errors.branchGstNumber?.message}
            id="branchGstNumber"
            placeholder="Enter GST number"
            required
          />

          <Input
            label="Branch Phone Number"
            {...register("branchPhoneNumber")}
            error={errors.branchPhoneNumber?.message}
            id="branchPhoneNumber"
            placeholder="Enter branch phone number"
            required
          />

          {/* Row 3: Address (full width) */}
          <div className="col-span-2">
            <Input
              label="Address"
              {...register("address")}
              error={errors.address?.message}
              id="address"
              placeholder="Enter full address"
              required
            />
          </div>

          {/* Row 4: Country, State, City (3 columns) */}
          <CountryStateCitySelector
            countryField="country"
            stateField="state"
            cityField="city"
            timeZoneField="timeZone"
            required
          />

          {/* Row 5: Pincode and Timezone */}
          <Input
            label="Pincode"
            {...register("pincode")}
            error={errors.pincode?.message}
            id="pincode"
            placeholder="Enter pincode"
            required
          />

          {/* Time Zone */}
          <div className="space-y-2 relative">
            <Label htmlFor="timeZone">
              Time Zone <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="timeZone"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLocationLoading}
                >
                  <SelectTrigger
                    id="timeZone"
                    className={`w-full cursor-pointer ${
                      errors.timeZone?.message ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {isLocationLoading && !timeZoneValue && (
              <div className="absolute right-8 top-8">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
            {errors.timeZone && (
              <p className="text-sm text-red-500">{errors.timeZone.message}</p>
            )}
          </div>
        </div>

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
              ? "Update Branch"
              : "Create Branch"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
