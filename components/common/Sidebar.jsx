"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiLogOut,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/lib/context/AuthContext";
import { useEffect, useState } from "react";

const adminMenuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: FiHome },
  { name: "Branches", href: "/admin/branches", icon: FiUsers },
  { name: "Profile", href: "/admin/profile", icon: FiSettings },
];

const userMenuItems = [
  { name: "Dashboard", href: "/user/dashboard", icon: FiHome },
  { name: "Customers", href: "/user/customers", icon: FiUsers },
  { name: "Products", href: "/user/products", icon: FiPackage },
  // { name: "Billing", href: "/user/billing", icon: FiPackage },
  { name: "Profile", href: "/user/profile", icon: FiUser },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = user?.type === "admin" ? adminMenuItems : userMenuItems;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Mobile Close */}
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <h1 className="text-xl font-bold">RetailCraft</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <FiX size={22} />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-center mb-8 hidden lg:block">
            RetailCraft
          </h1>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? user?.type === "admin"
                        ? "bg-blue-600"
                        : "bg-green-600"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
