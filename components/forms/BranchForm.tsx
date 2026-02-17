"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Country, State, City } from "country-state-city";
import moment from "moment-timezone";
import { SearchSelect } from "../ui/search-select";

// Get all countries
const countries = Country.getAllCountries().map((country) => ({
  value: country.name,
  label: country.name,
  isoCode: country.isoCode,
}));

// Get all timezones
const timezones = moment.tz.names().map((tz) => ({
  value: tz,
  label: tz.replace(/_/g, " "),
}));

// Define the branch schema
const branchSchema = z.object({
  branchName: z.string().min(1, "Branch name is required"),
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
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: initialData || {},
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === selectedCountry,
      );

      if (!countryObj) return;

      const countryStates = State.getStatesOfCountry(countryObj.isoCode).map(
        (state) => ({
          value: state.name, // save full name
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

  const handleFormSubmit = (data: BranchFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Branch Name */}
        <Input
          label="Branch Name"
          {...register("branchName")}
          error={errors.branchName?.message}
          id="branchName"
          placeholder="Enter branch name"
          required
        />

        {/* Branch Code */}
        <Input
          label="Branch Code"
          {...register("branchCode")}
          error={errors.branchCode?.message}
          id="branchCode"
          placeholder="Enter branch code"
          required
        />

        {/* GST Number */}
        <Input
          label="GST Number"
          {...register("branchGstNumber")}
          error={errors.branchGstNumber?.message}
          id="branchGstNumber"
          placeholder="Enter GST number"
          required
        />

        {/* Time Zone */}
        <Controller
          name="timeZone"
          control={control}
          render={({ field }) => (
            <SearchSelect
              label="Time Zone"
              options={timezones}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select time zone"
              searchPlaceholder="Search timezone..."
              error={errors.timeZone?.message}
              required
            />
          )}
        />

        {/* Address */}
        <Input
          label="Address"
          {...register("address")}
          error={errors.address?.message}
          className="col-span-2"
          id="address"
          placeholder="Enter full address"
          required
        />

        {/* Country */}
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

        {/* State */}
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

        {/* City */}
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <SearchSelect
              label="City"
              options={cities}
              value={field.value}
              onChange={field.onChange}
              placeholder={selectedState ? "Select city" : "Select state first"}
              searchPlaceholder="Search city..."
              error={errors.city?.message}
              disabled={!selectedState}
              required
            />
          )}
        />

        {/* Pincode */}
        <Input
          label="Pincode"
          {...register("pincode")}
          error={errors.pincode?.message}
          id="pincode"
          placeholder="Enter pincode"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Branch"
            : "Create Branch"}
        </Button>
      </div>
    </form>
  );
}
