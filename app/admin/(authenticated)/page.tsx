"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api-client";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";

interface DashboardStats {
  totalBranches: number;
  totalUsers: number;
  totalCustomers: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalBranches: 0,
    totalUsers: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentBranches, setRecentBranches] = useState([]);

  const { loading, execute: fetchDashboardData } = useApi<any>();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const result = await fetchDashboardData(() =>
      apiClient.get("/admin/dashboard"),
    );
    if (result.success && result.data) {
      setStats(result.data.stats);
      setRecentBranches(result.data.recentBranches);
    }
  };

  const statCards = [
    {
      name: "Total Branches",
      value: stats.totalBranches,
      icon: "🏢",
      color: "bg-blue-500",
    },
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      color: "bg-green-500",
    },
    {
      name: "Total Customers",
      value: stats.totalCustomers,
      icon: "👤",
      color: "bg-yellow-500",
    },
    {
      name: "Total Products",
      value: stats.totalProducts,
      icon: "📦",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your retail network today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
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
          </div>
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
              href="/admin/branches"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 group"
            >
              <span className="text-3xl mb-2 block">🏢</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                Add New Branch
              </span>
            </Link>
            <Link
              href="/admin/users"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 group"
            >
              <span className="text-3xl mb-2 block">👥</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                Add Branch User
              </span>
            </Link>
            <Link
              href="/admin/reports"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 group"
            >
              <span className="text-3xl mb-2 block">📊</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                View Reports
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Branches */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Branches
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Recently added branches in your network.
            </p>
          </div>
          <Link
            href="/admin/branches"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {recentBranches.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentBranches.map((branch: any) => (
                <li
                  key={branch.id}
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {branch.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {branch.address}, {branch.city}, {branch.state}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-900">{branch.phone}</p>
                      <p className="text-sm text-gray-500">{branch.email}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-12 text-center">
              <span className="text-4xl mb-4 block">🏢</span>
              <p className="text-gray-500">No branches added yet</p>
              <Link
                href="/admin/branches"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
              >
                Add your first branch →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
