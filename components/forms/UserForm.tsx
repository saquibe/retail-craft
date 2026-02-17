"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Mail, User as UserIcon } from "lucide-react";

// Define the user schema
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

// Infer the type from the schema
export type UserFormData = z.infer<typeof userSchema>;

// Define props interface
interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void> | void;
  isLoading?: boolean;
  onCancel?: () => void;
  branchName?: string;
}

export default function UserForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
  branchName,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
    },
  });

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {branchName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Branch:</span> {branchName}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div className="relative">
          <UserIcon className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
          <Input
            label="Full Name"
            {...register("name")}
            error={errors.name?.message}
            id="name"
            placeholder="Enter user's full name"
            className="pl-10"
            required
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
          <Input
            label="Email Address"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            id="email"
            placeholder="Enter user's email"
            className="pl-10"
            required
          />
        </div>

        {/* Password Info - only shown for new users */}
        {!initialData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Note:</span> A strong password will
              be auto-generated and sent to the user's email.
            </p>
          </div>
        )}
      </div>

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
            ? "Update User"
            : "Create User"}
        </Button>
      </div>
    </form>
  );
}
