"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Redirect authenticated users to their respective dashboards
  const getDashboardLink = () => {
    if (!isAuthenticated) return null;
    return user?.role === "admin" ? "/admin" : "/user";
  };

  const dashboardLink = getDashboardLink();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  RetailCraft
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {dashboardLink ? (
                // Show Dashboard button if already logged in
                <Link
                  href={dashboardLink}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                // Show login buttons if not logged in
                <>
                  <Link
                    href="/admin/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Admin Login
                  </Link>
                  <Link
                    href="/user/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    User Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-indigo-600">RetailCraft</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Complete retail management solution for your business. Manage
            branches, customers, products, and more with our comprehensive
            platform.
          </p>

          {/* Stats Section */}
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 max-w-3xl mx-auto">
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600">50+</div>
              <div className="text-sm text-gray-600">Branches</div>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600">1000+</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600">5000+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>

          {/* {!dashboardLink && (
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/user/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/admin/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors shadow-md hover:shadow-lg"
                >
                  Admin Portal
                </Link>
              </div>
            </div>
          )} */}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Everything you need to manage your retail business
          </h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-3xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Branch Management
              </h3>
              <p className="text-gray-500">
                Easily manage multiple branches and their users from a
                centralized dashboard with real-time updates.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-3xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Customer Management
              </h3>
              <p className="text-gray-500">
                Handle B2B and B2C customers with detailed information, GST
                compliance, and customer history tracking.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-3xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Product Inventory
              </h3>
              <p className="text-gray-500">
                Track products with barcodes, pricing, tax information for both
                B2B and B2C, and real-time stock management.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-3xl mb-4">🛒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Order Management
              </h3>
              <p className="text-gray-500">
                Process orders efficiently with automated invoicing and
                real-time order tracking.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-3xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Reports & Analytics
              </h3>
              <p className="text-gray-500">
                Get detailed insights with customizable reports and analytics
                dashboard for better decision making.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-indigo-600 text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Secure & Scalable
              </h3>
              <p className="text-gray-500">
                Enterprise-grade security with role-based access control and
                scalable architecture for growing businesses.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Trusted by retail businesses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-600 mb-4">
                "RetailCraft has transformed how we manage our multiple
                branches. The customer management features are exactly what we
                needed."
              </p>
              <div className="font-medium text-gray-900">- Rajesh Kumar</div>
              <div className="text-sm text-gray-500">Store Owner</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-600 mb-4">
                "The product inventory system is fantastic. Barcode scanning and
                tax calculations save us hours of work every day."
              </p>
              <div className="font-medium text-gray-900">- Priya Sharma</div>
              <div className="text-sm text-gray-500">Inventory Manager</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-600 mb-4">
                "Excellent support team and regular updates. The B2B/B2C
                customer separation is perfect for our business model."
              </p>
              <div className="font-medium text-gray-900">- Amit Patel</div>
              <div className="text-sm text-gray-500">Business Owner</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!dashboardLink && (
          <div className="mt-24 text-center">
            <div className="bg-indigo-700 rounded-2xl shadow-xl p-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to streamline your retail business?
              </h3>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join hundreds of retailers who are already using RetailCraft to
                manage their business efficiently.
              </p>
              <Link
                href="/user/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Get Started Now
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold text-indigo-600 mb-4">
                RetailCraft
              </h4>
              <p className="text-sm text-gray-500">
                Complete retail management solution for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="text-sm text-gray-500 hover:text-indigo-600"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-gray-500 hover:text-indigo-600"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-gray-500 hover:text-indigo-600"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-500 hover:text-indigo-600"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-500 hover:text-indigo-600"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-sm text-gray-500 hover:text-indigo-600"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-500 hover:text-indigo-600"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-500 hover:text-indigo-600"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} RetailCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
