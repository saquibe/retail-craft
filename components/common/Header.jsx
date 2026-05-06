"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { FiMenu, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header({ setSidebarOpen }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [imageKey, setImageKey] = useState(Date.now());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (user?.profilePicture) {
      setImageKey(Date.now());
    }
  }, [user?.profilePicture]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest(".profile-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.contactName || user.name || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const profilePictureUrl = user.profilePicture
    ? `${user.profilePicture}?t=${imageKey}`
    : null;

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push("/");
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    router.push(`/${user.type}/profile`);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white shadow-sm z-30">
      <div className="px-4 md:px-6 py-4 flex justify-between items-center">
        {/* Mobile Toggle */}
        <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <FiMenu size={22} />
        </button>

        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          Welcome, {displayName}!
        </h2>

        {/* Profile Dropdown */}
        <div className="relative profile-dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition cursor-pointer"
                key={imageKey}
                alt="Profile"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold hover:opacity-80 transition">
                {initial}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleProfile}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <FiUser className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
