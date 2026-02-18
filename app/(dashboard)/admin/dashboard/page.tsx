"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // console.log("AdminDashboard - Component mounted");
  }, []);

  useEffect(() => {
    // console.log("AdminDashboard - useEffect triggered", {
    //   isClient,
    //   loading,
    //   user: user ? { id: user.id, name: user.name, type: user.type } : null,
    //   path: window.location.pathname,
    // });

    // Only run this on the client side and after loading is complete
    if (isClient && !loading) {
      // console.log("AdminDashboard - checking auth state");

      // If no user and not loading, redirect to home
      if (!user) {
        // console.log("AdminDashboard - NO USER FOUND! Redirecting to home");
        router.push("/");
      } else {
        // console.log("AdminDashboard - USER FOUND! Rendering dashboard");
      }
    }
  }, [isClient, loading, user, router]);

  // Show loading state
  if (loading || !isClient) {
    // console.log("AdminDashboard - rendering loading state", {
    //   loading,
    //   isClient,
    // });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render anything (will redirect)
  if (!user) {
    // console.log("AdminDashboard - no user, rendering null");
    return null;
  }

  // console.log("AdminDashboard - rendering with user:", user.name);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <div className="mb-4">
            <p className="text-gray-600">
              Welcome, <span className="font-semibold">{user.name}</span>!
            </p>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">Role: {user.type}</p>
          </div>
          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
