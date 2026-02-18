"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserProfile, updateUserProfile } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import {
  Camera,
  Save,
  Loader2,
  User as UserIcon,
  Mail,
  Building2,
} from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfile() {
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
      name: "",
    },
  });

  // Fetch full profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const response = await getUserProfile();
        console.log("Fetched user profile:", response);

        // Get current branch info from user context (from login)
        const currentBranchName = user?.branchName;
        const currentBranchCode = user?.branchCode;
        const currentBranchId = user?.branchId;

        console.log("Current branch info from user context:", {
          currentBranchName,
          currentBranchCode,
          currentBranchId,
        });

        // Merge profile data with existing branch info from user context
        const mergedProfile = {
          ...response,
          // Preserve branch info from user context (which came from login)
          branchName: currentBranchName || response.branchId?.branchName,
          branchCode: currentBranchCode || response.branchId?.branchCode,
          branchId:
            currentBranchId || response.branchId?._id || response.branchId,
        };

        console.log("Merged profile:", mergedProfile);
        setProfileData(mergedProfile);

        reset({
          name: response.name || "",
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

    if (user) {
      fetchProfile();
    }
  }, [reset, user]);

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

      // Append name
      formData.append("name", data.name);

      // Append profile image if selected
      if (profileImage) {
        formData.append("profilePicture", profileImage);
      }

      console.log("Submitting form data");
      const response = await updateUserProfile(formData);

      if (response) {
        toast.success("Profile updated successfully!");

        // Refresh profile data
        const updatedProfile = await getUserProfile();

        // Get current branch info from user context (preserve it)
        const currentBranchName = user?.branchName;
        const currentBranchCode = user?.branchCode;
        const currentBranchId = user?.branchId;

        console.log("Preserving branch info:", {
          currentBranchName,
          currentBranchCode,
          currentBranchId,
        });

        // Update user in context while preserving branch info
        if (updateUser) {
          updateUser({
            name: updatedProfile.name,
            profilePicture: updatedProfile.profilePicture,
            // Preserve branch info from user context
            branchName: currentBranchName,
            branchCode: currentBranchCode,
            branchId: currentBranchId,
          });
        }

        // Update local profile data
        setProfileData({
          ...updatedProfile,
          branchName: currentBranchName,
          branchCode: currentBranchCode,
        });

        setProfileImage(null);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get branch info from various sources
  const getBranchInfo = () => {
    console.log("Getting branch info from:", { profileData, user });

    // Try from profileData first (merged data)
    if (profileData) {
      if (profileData.branchName || profileData.branchCode) {
        return {
          name: profileData.branchName,
          code: profileData.branchCode,
        };
      }
      // Check if branchId is an object with branch details
      if (profileData.branchId && typeof profileData.branchId === "object") {
        return {
          name: profileData.branchId.branchName,
          code: profileData.branchId.branchCode,
        };
      }
    }

    // Then try from user context (which has branch info from login)
    if (user) {
      return {
        name: user.branchName,
        code: user.branchCode,
      };
    }

    return { name: null, code: null };
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const branchInfo = getBranchInfo();
  console.log("Branch info to display:", branchInfo);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-500">Manage your account settings</p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={imagePreview || ""} />
                <AvatarFallback className="text-2xl bg-green-100 text-green-600">
                  {profileData?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
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
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    {...register("name")}
                    error={errors.name?.message}
                    placeholder="Enter your name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    value={profileData?.email || user?.email || ""}
                    placeholder="Email cannot be changed"
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Branch Information (Read-only) */}
            {(branchInfo.name || branchInfo.code) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Branch Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Branch Name</p>
                    <p className="text-sm font-medium">
                      {branchInfo.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Branch Code</p>
                    <p className="text-sm font-medium">
                      {branchInfo.code || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
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
    </div>
  );
}
