"use client";

import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const { user } = useAuth();
  const [imageKey, setImageKey] = useState(Date.now());

  // Force image refresh when profile picture changes
  useEffect(() => {
    if (user?.profilePicture) {
      setImageKey(Date.now());
    }
  }, [user?.profilePicture]);

  // Don't render header if no user
  if (!user) return null;

  // Get the display name - try contactName first, then name, then fallback
  const displayName = user.contactName || user.name || "User";

  // Get initial for avatar
  const initial = displayName.charAt(0).toUpperCase();

  // Add timestamp to profile picture URL to force refresh
  const profilePictureUrl = user.profilePicture
    ? `${user.profilePicture}?t=${imageKey}`
    : null;

  return (
    <header className="bg-white shadow-sm fixed top-0 right-0 left-64 z-10">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome, {displayName}!
        </h2>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {profilePictureUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={profilePictureUrl}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  key={imageKey} // Force re-render when image changes
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                {initial}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">{displayName}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.type === "admin" ? "Administrator" : "Branch User"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
