"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { toast } from "react-hot-toast";
import { Camera, Save, Loader2 } from "lucide-react";

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

  const {
    register,
    handleSubmit,
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

  // Fetch full profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const response = await getAdminProfile();
        // console.log("Fetched profile:", response);
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

      // console.log("Submitting form data:", Object.fromEntries(formData));

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
                  <AvatarFallback className="text-2xl">
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Contact Name"
                  {...register("contactName")}
                  error={errors.contactName?.message}
                  placeholder="Enter contact name"
                />
                <Input
                  label="Company Name"
                  {...register("companyName")}
                  error={errors.companyName?.message}
                  placeholder="Enter company name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData?.email || ""}
                  placeholder="Email cannot be changed"
                  disabled
                  className="bg-gray-50"
                />
                <Input
                  label="Contact Number"
                  {...register("contactNumber")}
                  error={errors.contactNumber?.message}
                  placeholder="Enter contact number"
                />
                <Input
                  label="Telephone Number"
                  {...register("teliphoneNumber")}
                  error={errors.teliphoneNumber?.message}
                  placeholder="Enter telephone number"
                />
              </div>
            </Card>

            {/* Address Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Address Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Address"
                  {...register("address")}
                  error={errors.address?.message}
                  placeholder="Enter address"
                  className="col-span-2"
                />
                <Input
                  label="Country"
                  {...register("country")}
                  error={errors.country?.message}
                  placeholder="Enter country"
                />
                <Input
                  label="State"
                  {...register("state")}
                  error={errors.state?.message}
                  placeholder="Enter state"
                />
                <Input
                  label="City"
                  {...register("city")}
                  error={errors.city?.message}
                  placeholder="Enter city"
                />
                <Input
                  label="Pincode"
                  {...register("pincode")}
                  error={errors.pincode?.message}
                  placeholder="Enter pincode"
                />
                <Input
                  label="Time Zone"
                  {...register("timeZone")}
                  error={errors.timeZone?.message}
                  placeholder="e.g., Asia/Kolkata"
                />
                <Input
                  label="Website Link"
                  {...register("websiteLink")}
                  error={errors.websiteLink?.message}
                  placeholder="https://example.com"
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Business Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="PAN Number"
                  {...register("panNumber")}
                  error={errors.panNumber?.message}
                  placeholder="Enter PAN number"
                />
                <Input
                  label="CIN Number"
                  {...register("cinNumber")}
                  error={errors.cinNumber?.message}
                  placeholder="Enter CIN number"
                />
                <Input
                  label="FSSAI Number"
                  {...register("fssaiNumber")}
                  error={errors.fssaiNumber?.message}
                  placeholder="Enter FSSAI number"
                />
                <Input
                  label="LUT Number"
                  {...register("lutNumber")}
                  error={errors.lutNumber?.message}
                  placeholder="Enter LUT number"
                />
                <Input
                  label="TAN Number"
                  {...register("tanNumber")}
                  error={errors.tanNumber?.message}
                  placeholder="Enter TAN number"
                />
                <Input
                  label="IEC Number"
                  {...register("iecNumber")}
                  error={errors.iecNumber?.message}
                  placeholder="Enter IEC number"
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Financial Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Financial Start Date"
                  type="date"
                  value={
                    profileData?.financialStartDate
                      ? new Date(profileData.financialStartDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  disabled
                  className="bg-gray-50"
                />
                <Input
                  label="Financial End Date"
                  type="date"
                  value={
                    profileData?.financialEndDate
                      ? new Date(profileData.financialEndDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 col-span-2">
                  Financial dates cannot be modified after registration.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="GST Number"
                  {...register("gstIn")}
                  error={errors.gstIn?.message}
                  placeholder="Enter GST number"
                />
                <Input
                  label="GST Registration Type"
                  {...register("GstRegistrationType")}
                  error={errors.GstRegistrationType?.message}
                  placeholder="Enter GST registration type"
                />
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
