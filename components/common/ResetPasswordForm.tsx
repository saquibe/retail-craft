"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"admin" | "user">(
    (searchParams.get("type") as "admin" | "user") || "admin",
  );

  // useEffect(() => {
  //   // Get user type from URL query parameter
  //   const type = searchParams.get("type");
  //   if (type === "user" || type === "admin") {
  //     setUserType(type);
  //   }
  // }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Password strength checker
  const passwordChecks = [
    { label: "At least 8 characters", met: password?.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    {
      label: "Contains special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await resetPassword(token, data.password, userType);

      if (response) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(userType === "admin" ? "/admin-login" : "/user-login");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-green-600">
            Password Reset Successful!
          </CardTitle>
          <CardDescription className="text-center">
            Your {userType} account password has been reset successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600">
          <p>
            You will be redirected to the {userType} login page in a few
            seconds.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            onClick={() =>
              router.push(userType === "admin" ? "/admin-login" : "/user-login")
            }
          >
            Go to Login Now
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Your {userType === "admin" ? "Admin" : "User"} Password
        </CardTitle>
        <CardDescription className="text-center">
          Please enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  error={errors.password?.message}
                  placeholder="Enter new password"
                  className="pl-10"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Password requirements:
                </p>
                {passwordChecks.map((check, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <span
                      className={`mr-2 ${
                        check.met ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {check.met ? "✓" : "○"}
                    </span>
                    <span
                      className={check.met ? "text-green-700" : "text-gray-500"}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                  placeholder="Confirm new password"
                  className="pl-10"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 text-sm"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href={userType === "admin" ? "/admin-login" : "/user-login"}
          className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to {userType === "admin" ? "Admin" : "User"} Login
        </Link>
      </CardFooter>
    </Card>
  );
}
