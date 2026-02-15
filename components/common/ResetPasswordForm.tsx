"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface ResetPasswordFormProps {
  role: "admin" | "user";
  token: string;
}

export default function ResetPasswordForm({
  role,
  token,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "bg-gray-200";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "No password";
      case 1:
        return "Very weak";
      case 2:
        return "Weak";
      case 3:
        return "Fair";
      case 4:
        return "Good";
      case 5:
        return "Strong";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (password !== confirmPassword) {
    //   toast.error("Passwords do not match");
    //   return;
    // }

    // if (password.length < 8) {
    //   toast.error("Password must be at least 8 characters long");
    //   return;
    // }

    // setLoading(true);
    // try {
    //   const response = await apiClient.post(`/auth/${role}/reset-password`, {
    //     token,
    //     newPassword: password,
    //     confirmPassword,
    //   });

    //   if (response.success) {
    //     toast.success("Password reset successfully!");
    //     setTimeout(() => {
    //       router.push(`/${role}/login`);
    //     }, 2000);
    //   } else {
    //     toast.error(response.error || "Failed to reset password");
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
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Password strength meter */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-500">Password strength:</div>
              <div className="text-xs font-medium">{getStrengthText()}</div>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStrengthColor()} transition-all duration-300`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
          </div>

          <ul className="mt-2 text-xs text-gray-500 space-y-1">
            <li className={password.length >= 8 ? "text-green-600" : ""}>
              ✓ At least 8 characters
            </li>
            <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
              ✓ Contains lowercase letter
            </li>
            <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
              ✓ Contains uppercase letter
            </li>
            <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
              ✓ Contains number
            </li>
            <li
              className={/[^a-zA-Z0-9]/.test(password) ? "text-green-600" : ""}
            >
              ✓ Contains special character
            </li>
          </ul>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`appearance-none relative block w-full px-3 py-3 border ${
              confirmPassword && password !== confirmPassword
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none sm:text-sm`}
            placeholder="Confirm new password"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={
              loading || password !== confirmPassword || password.length < 8
            }
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
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </div>

        <div className="text-center">
          <Link
            href={`/${role}/login`}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
