"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api-client";
import Header from "@/components/user/Header";
import Sidebar from "@/components/user/Sidebar";

export default function AuthenticatedUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
    const token = apiClient.getToken();
    if (!token || !isAuthenticated) {
      router.push("/user/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    apiClient.clearToken();
    router.push("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        user={user || undefined}
        onMenuClick={toggleSidebar}
        onLogout={handleLogout}
      />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          userName={user?.name}
          userEmail={user?.email}
          branchId={user?.branchId}
        />

        {/* Main Content */}
        <main className="flex-1 bg-gray-100 min-h-screen p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
