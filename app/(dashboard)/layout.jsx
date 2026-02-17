"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("DashboardLayout - Component mounted");
  }, []);

  useEffect(() => {
    console.log("DashboardLayout - useEffect triggered", {
      isClient,
      loading,
      user: user ? { id: user.id, name: user.name, type: user.type } : null,
      path: window.location.pathname,
    });

    // Only run this on the client side and after loading is complete
    if (isClient && !loading) {
      console.log("DashboardLayout - checking auth state");

      // If no user and not loading, redirect to home
      if (!user) {
        console.log("DashboardLayout - NO USER FOUND! Redirecting to home");
        router.push("/");
      } else {
        console.log("DashboardLayout - USER FOUND! Rendering dashboard");
      }
    }
  }, [isClient, loading, user, router]);

  // Show loading state while checking auth
  if (loading || !isClient) {
    console.log("DashboardLayout - rendering loading state", {
      loading,
      isClient,
    });
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
    console.log("DashboardLayout - no user, rendering null");
    return null;
  }

  console.log("DashboardLayout - rendering layout with user:", user.name);
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6 mt-16">{children}</main>
      </div>
    </div>
  );
}
