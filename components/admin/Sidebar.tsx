"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Branches", href: "/admin/branches", icon: "🏢" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Reports", href: "/admin/reports", icon: "📈" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar({
  isOpen,
  onClose,
  userName,
  userEmail,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
          transition duration-200 ease-in-out
          z-30 w-64 bg-indigo-800 shadow-lg h-screen lg:h-auto
          mt-16 lg:mt-0
        `}
      >
        <div className="p-4">
          {/* Mobile User Info */}
          <div className="mb-6 lg:hidden">
            <p className="text-sm font-medium text-indigo-100">
              {userName || "Admin"}
            </p>
            <p className="text-xs text-indigo-200">{userEmail}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg 
                    transition-colors duration-200
                    ${
                      isActive
                        ? "bg-indigo-900 text-white"
                        : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                    }
                  `}
                  onClick={onClose}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin Info */}
          <div className="mt-6 pt-6 border-t border-indigo-700">
            <p className="text-xs text-indigo-200 mb-2">Admin Access</p>
            <div className="flex items-center">
              <span className="text-lg mr-2">👑</span>
              <span className="text-sm font-medium text-indigo-100">
                Super Admin
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
