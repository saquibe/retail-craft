"use client";

import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { useApi } from "@/hooks/useApi";

interface ForgotPasswordFormProps {
  role: "admin" | "user";
  onBack: () => void;
  onSuccess: (email: string) => void;
}

export default function ForgotPasswordForm({
  role,
  onBack,
  onSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!captchaToken) {
    //   toast.error("Please complete the captcha");
    //   return;
    // }

    // setLoading(true);
    // try {
    //   const response = await apiClient.post(`/auth/${role}/forgot-password`, {
    //     email,
    //     captchaToken,
    //   });

    //   if (response.success) {
    //     toast.success("Password reset link sent to your email!");
    //     onSuccess(email);
    //   } else {
    //     toast.error(response.error || "Failed to send reset link");
    //   }
    // } catch (error: any) {
    //   toast.error(error.message || "Something went wrong");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your email"
          />
        </div>

        <div className="flex justify-center py-2">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setCaptchaToken(token)}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Back to login
          </button>
        </div>
      </form>
    </div>
  );
}
