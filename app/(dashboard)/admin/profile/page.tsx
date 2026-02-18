"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/context/AuthContext";
import { getAdminProfile, updateAdminProfile } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SearchSelect } from "@/components/ui/search-select";
import { toast } from "react-hot-toast";
import {
  Camera,
  Save,
  Loader2,
  User,
  Building,
  Phone,
  MapPin,
  Globe,
  Clock,
  Link as LinkIcon,
  FileText,
  Calendar,
  Hash,
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import moment from "moment-timezone";

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

// Profile schema based on backend fields
const profileSchema = z.object({
  // Personal & Company Info
  contactName: z.string().min(1, "Contact name is required"),
  companyName: z.string().min(1, "Company name is required"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits"),
  teliphoneNumber: z.string().optional(),

  // Address Info
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),
  timeZone: z.string().min(1, "Time zone is required"),

  // Business Info
  websiteLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  panNumber: z.string().min(1, "PAN number is required"),
  GstRegistrationType: z.string().min(1, "GST registration type is required"),
  gstIn: z.string().min(1, "GST number is required"),
  cinNumber: z.string().min(1, "CIN number is required"),
  fssaiNumber: z.string().min(1, "FSSAI number is required"),
  lutNumber: z.string().min(1, "LUT number is required"),
  tanNumber: z.string().min(1, "TAN number is required"),
  iecNumber: z.string().min(1, "IEC number is required"),

  // Financial Dates (read-only in form)
  financialStartDate: z.string().optional(),
  financialEndDate: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      contactName: "",
      companyName: "",
      contactNumber: "",
      teliphoneNumber: "",
      address: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      timeZone: "",
      websiteLink: "",
      panNumber: "",
      GstRegistrationType: "",
      gstIn: "",
      cinNumber: "",
      fssaiNumber: "",
      lutNumber: "",
      tanNumber: "",
      iecNumber: "",
      financialStartDate: "",
      financialEndDate: "",
    },
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Fetch full profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const response = await getAdminProfile();
        console.log("Fetched profile:", response);
        setProfileData(response);

        // Map the response to form fields
        reset({
          contactName: response.contactName || "",
          companyName: response.companyName || "",
          contactNumber: response.contactNumber || "",
          teliphoneNumber: response.teliphoneNumber || "",
          address: response.address || "",
          country: response.country || "",
          state: response.state || "",
          city: response.city || "",
          pincode: response.pincode || "",
          timeZone: response.timeZone || "",
          websiteLink: response.websiteLink || "",
          panNumber: response.panNumber || "",
          GstRegistrationType: response.GstRegistrationType || "",
          gstIn: response.gstIn || "",
          cinNumber: response.cinNumber || "",
          fssaiNumber: response.fssaiNumber || "",
          lutNumber: response.lutNumber || "",
          tanNumber: response.tanNumber || "",
          iecNumber: response.iecNumber || "",
          financialStartDate: response.financialStartDate
            ? new Date(response.financialStartDate).toISOString().split("T")[0]
            : "",
          financialEndDate: response.financialEndDate
            ? new Date(response.financialEndDate).toISOString().split("T")[0]
            : "",
        });

        if (response.profilePicture) {
          setImagePreview(response.profilePicture);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [reset]);

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

      // Only reset state and city if they don't match the current profile data
      if (profileData?.state && profileData.country === selectedCountry) {
        // Keep the state from profile data
        setValue("state", profileData.state);

        // Load cities for this state
        const stateObj = countryStates.find(
          (s) => s.value === profileData.state,
        );
        if (stateObj) {
          const stateCities = City.getCitiesOfState(
            countryObj.isoCode,
            stateObj.isoCode,
          ).map((city) => ({
            value: city.name,
            label: city.name,
          }));
          setCities(stateCities);
          setValue("city", profileData.city || "");
        }
      } else {
        setValue("state", "");
        setValue("city", "");
        setCities([]);
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountry, setValue, profileData]);

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

      // Only reset city if it doesn't match profile data
      if (!profileData?.city || profileData.state !== selectedState) {
        setValue("city", "");
      }
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState, setValue, profileData]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Append all form fields (excluding read-only fields)
      const updatableFields = [
        "contactName",
        "companyName",
        "contactNumber",
        "teliphoneNumber",
        "address",
        "country",
        "state",
        "city",
        "pincode",
        "timeZone",
        "websiteLink",
        "panNumber",
        "GstRegistrationType",
        "gstIn",
        "cinNumber",
        "fssaiNumber",
        "lutNumber",
        "tanNumber",
        "iecNumber",
      ];

      updatableFields.forEach((key) => {
        const value = data[key as keyof ProfileFormData];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Append profile image if selected
      if (profileImage) {
        formData.append("profilePicture", profileImage);
      }

      console.log("Submitting form data:", Object.fromEntries(formData));

      const response = await updateAdminProfile(formData);

      if (response) {
        toast.success("Profile updated successfully!");

        // Refresh profile data
        const updatedProfile = await getAdminProfile();
        setProfileData(updatedProfile);

        // Update user in context with the updated fields
        if (updateUser) {
          updateUser({
            contactName: updatedProfile.contactName,
            companyName: updatedProfile.companyName,
            contactNumber: updatedProfile.contactNumber,
            teliphoneNumber: updatedProfile.teliphoneNumber,
            profilePicture: updatedProfile.profilePicture,
            name: updatedProfile.contactName || updatedProfile.companyName,
          });
        }

        // Clear the profile image state after successful upload
        setProfileImage(null);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="business">Business Details</TabsTrigger>
          <TabsTrigger value="financial">Financial Info</TabsTrigger>
          <TabsTrigger value="tax">Tax Information</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="general" className="space-y-6">
            {/* Profile Picture */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={imagePreview || ""} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {profileData?.contactName?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("profileImage")?.click()
                    }
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Contact Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("contactName")}
                      error={errors.contactName?.message}
                      placeholder="Enter contact name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("companyName")}
                      error={errors.companyName?.message}
                      placeholder="Enter company name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={profileData?.email || ""}
                      placeholder="Email cannot be changed"
                      disabled
                      className="pl-3 bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("contactNumber")}
                      error={errors.contactNumber?.message}
                      placeholder="Enter contact number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Telephone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("teliphoneNumber")}
                      error={errors.teliphoneNumber?.message}
                      placeholder="Enter telephone number"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Address Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Address Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("address")}
                      error={errors.address?.message}
                      placeholder="Enter address"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <SearchSelect
                        label="Country *"
                        options={countries}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select country"
                        searchPlaceholder="Search country..."
                        error={errors.country?.message}
                        // required
                      />
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <SearchSelect
                        label="State *"
                        options={states}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={
                          selectedCountry
                            ? "Select state"
                            : "Select country first"
                        }
                        searchPlaceholder="Search state..."
                        error={errors.state?.message}
                        disabled={!selectedCountry}
                        // required
                      />
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <SearchSelect
                        label="City *"
                        options={cities}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={
                          selectedState ? "Select city" : "Select state first"
                        }
                        searchPlaceholder="Search city..."
                        error={errors.city?.message}
                        disabled={!selectedState}
                        // required
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Pincode *
                  </label>
                  <div className="relative">
                    {/* <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /> */}
                    <Input
                      {...register("pincode")}
                      error={errors.pincode?.message}
                      placeholder="Enter pincode"
                      // className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Controller
                    name="timeZone"
                    control={control}
                    render={({ field }) => (
                      <SearchSelect
                        label="Time Zone *"
                        options={timezones}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select time zone"
                        searchPlaceholder="Search timezone..."
                        error={errors.timeZone?.message}
                        // required
                      />
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Website Link
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("websiteLink")}
                      error={errors.websiteLink?.message}
                      placeholder="https://example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    PAN Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("panNumber")}
                      error={errors.panNumber?.message}
                      placeholder="Enter PAN number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    CIN Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("cinNumber")}
                      error={errors.cinNumber?.message}
                      placeholder="Enter CIN number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    FSSAI Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("fssaiNumber")}
                      error={errors.fssaiNumber?.message}
                      placeholder="Enter FSSAI number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    LUT Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("lutNumber")}
                      error={errors.lutNumber?.message}
                      placeholder="Enter LUT number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    TAN Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("tanNumber")}
                      error={errors.tanNumber?.message}
                      placeholder="Enter TAN number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    IEC Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("iecNumber")}
                      error={errors.iecNumber?.message}
                      placeholder="Enter IEC number"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Financial Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Financial Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="date"
                      value={
                        profileData?.financialStartDate
                          ? new Date(profileData.financialStartDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Financial End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="date"
                      value={
                        profileData?.financialEndDate
                          ? new Date(profileData.financialEndDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-500 col-span-2">
                  Financial dates cannot be modified after registration.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    GST Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("gstIn")}
                      error={errors.gstIn?.message}
                      placeholder="Enter GST number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    GST Registration Type *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...register("GstRegistrationType")}
                      error={errors.GstRegistrationType?.message}
                      placeholder="Enter GST registration type"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
