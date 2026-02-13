"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api-client";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: string;
  type: "customer" | "product" | "order";
  description: string;
  timestamp: string;
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  const { loading, execute: fetchDashboardData } = useApi<any>();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const result = await fetchDashboardData(() =>
      apiClient.get(`/user/dashboard?branchId=${user?.branchId}`),
    );
    if (result.success && result.data) {
      setStats(result.data.stats);
      setRecentActivities(result.data.recentActivities);
      setRecentCustomers(result.data.recentCustomers);
      setRecentProducts(result.data.recentProducts);
    }
  };

  const statCards = [
    {
      name: "Total Customers",
      value: stats.totalCustomers,
      icon: "👥",
      color: "bg-blue-500",
      link: "/user/customers",
    },
    {
      name: "Total Products",
      value: stats.totalProducts,
      icon: "📦",
      color: "bg-green-500",
      link: "/user/products",
    },
    {
      name: "Total Orders",
      value: stats.totalOrders,
      icon: "🛒",
      color: "bg-yellow-500",
      link: "/user/orders",
    },
    {
      name: "Revenue (This Month)",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: "💰",
      color: "bg-purple-500",
      link: "/user/reports",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your branch today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {loading ? "..." : stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/user/customers"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 group"
            >
              <span className="text-3xl mb-2 block">👥</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                Add New Customer
              </span>
            </Link>
            <Link
              href="/user/products"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 group"
            >
              <span className="text-3xl mb-2 block">📦</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                Add New Product
              </span>
            </Link>
            <Link
              href="/user/orders/new"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 group"
            >
              <span className="text-3xl mb-2 block">🛒</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                Create New Order
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Customers */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Customers
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Latest customers added to your branch.
              </p>
            </div>
            <Link
              href="/user/customers"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {recentCustomers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentCustomers.map((customer: any) => (
                  <li
                    key={customer.id}
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.mobileNo}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            customer.type === "B2C"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {customer.type}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-12 text-center">
                <span className="text-4xl mb-4 block">👥</span>
                <p className="text-gray-500">No customers added yet</p>
                <Link
                  href="/user/customers"
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
                >
                  Add your first customer →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Products
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Latest products added to your inventory.
              </p>
            </div>
            <Link
              href="/user/products"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {recentProducts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentProducts.map((product: any) => (
                  <li
                    key={product.id}
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xl">📦</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {product.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Barcode: {product.barcode}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{product.b2bSalePrice} / ₹{product.b2cSalePrice}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.unit}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-12 text-center">
                <span className="text-4xl mb-4 block">📦</span>
                <p className="text-gray-500">No products added yet</p>
                <Link
                  href="/user/products"
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
                >
                  Add your first product →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
