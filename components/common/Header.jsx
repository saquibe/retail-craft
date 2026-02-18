"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { FiMenu } from "react-icons/fi";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header({ setSidebarOpen }) {
  const { user } = useAuth();
  const [imageKey, setImageKey] = useState(Date.now());

  useEffect(() => {
    if (user?.profilePicture) {
      setImageKey(Date.now());
    }
  }, [user?.profilePicture]);

  if (!user) return null;

  const displayName = user.contactName || user.name || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const profilePictureUrl = user.profilePicture
    ? `${user.profilePicture}?t=${imageKey}`
    : null;

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

        <Link href={`/${user.type}/profile`}>
          <div className="flex items-center space-x-3 cursor-pointer">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition"
                key={imageKey}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold hover:opacity-80 transition">
                {initial}
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
