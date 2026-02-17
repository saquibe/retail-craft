"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { forgotPassword } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Captcha from "@/components/common/Captcha";
import { Mail, ArrowLeft, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  userType: z.enum(["admin", "user"]).pipe(
    z.enum(["admin", "user"]).catch(() => {
      throw new Error("Please select user type");
    }),
  ),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") === "user" ? "user" : "admin";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      userType: defaultType,
    },
  });

  const email = watch("email");
  const userType = watch("userType");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword(data.email);

      if (response) {
        setIsSubmitted(true);
        toast.success(`Password reset link sent to your email!`);
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a password reset link to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-center font-medium text-green-800">{email}</p>
              <p className="text-center text-sm text-green-600 mt-1 capitalize">
                ({userType} account)
              </p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Click the link in the email to reset your password. If you don't
              see it, check your spam folder.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  userType === "admin" ? "/admin-login" : "/user-login",
                )
              }
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and select account type to receive a reset
            link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <Select
                  value={userType}
                  onValueChange={(value: "admin" | "user") =>
                    setValue("userType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Admin Account
                      </div>
                    </SelectItem>
                    <SelectItem value="user">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        User Account
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.userType && (
                  <p className="text-sm text-red-500">
                    {errors.userType.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <Input
                label="Email Address"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <Captcha
              onChange={(token: string | null) => setCaptchaToken(token)}
              onErrored={() => setCaptchaToken(null)}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link
            href="/admin-login"
            className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Admin Login
          </Link>
          <Link
            href="/user-login"
            className="text-sm text-green-600 hover:text-green-500 flex items-center"
          >
            User Login
            <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
