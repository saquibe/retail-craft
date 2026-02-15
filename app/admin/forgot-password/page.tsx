"use client";

import { useState } from "react";
import Link from "next/link";
import ForgotPasswordForm from "@/components/common/ForgotPasswordForm";

export default function AdminForgotPassword() {
  const [emailSent, setEmailSent] = useState<string | null>(null);

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{emailSent}</strong>
            </p>
            <div className="space-y-4">
              <Link
                href="/admin/login"
                className="block w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Return to login
              </Link>
              <button
                onClick={() => setEmailSent(null)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <ForgotPasswordForm
          role="admin"
          onBack={() => window.history.back()}
          onSuccess={setEmailSent}
        />
      </div>
    </div>
  );
}
