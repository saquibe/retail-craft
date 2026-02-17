"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiPackage,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import { useEffect, useState } from "react";

const adminMenuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: FiHome },
  { name: "Branches", href: "/admin/branches", icon: FiBriefcase },
  { name: "Users", href: "/admin/users", icon: FiUsers },
  { name: "Profile", href: "/admin/profile", icon: FiSettings },
];

const userMenuItems = [
  { name: "Dashboard", href: "/user/dashboard", icon: FiHome },
  { name: "Customers", href: "/user/customers", icon: FiUsers },
  { name: "Products", href: "/user/products", icon: FiPackage },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [imageKey, setImageKey] = useState(Date.now());

  useEffect(() => {
    if (user?.profilePicture) {
      setImageKey(Date.now());
    }
  }, [user?.profilePicture]);

  // Don't render sidebar if no user
  if (!user) return null;

  const menuItems = user?.type === "admin" ? adminMenuItems : userMenuItems;
  const displayName = user.contactName || user.name || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const profilePictureUrl = user.profilePicture
    ? `${user.profilePicture}?t=${imageKey}`
    : null;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 flex flex-col h-full">
        <h1 className="text-2xl font-bold text-center mb-8 text-white">
          RetailCraft
        </h1>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom of sidebar */}
        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors mb-4"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>

          <div className="flex items-center space-x-3 px-2">
            {profilePictureUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={profilePictureUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  key={imageKey}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
