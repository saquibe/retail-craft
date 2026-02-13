"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  branchId?: string;
}

const navigation = [
  { name: "Dashboard", href: "/user", icon: "📊" },
  { name: "Customers", href: "/user/customers", icon: "👥" },
  { name: "Products", href: "/user/products", icon: "📦" },
  { name: "Orders", href: "/user/orders", icon: "🛒" },
  { name: "Invoices", href: "/user/invoices", icon: "📄" },
  { name: "Reports", href: "/user/reports", icon: "📈" },
];

export default function Sidebar({
  isOpen,
  onClose,
  userName,
  userEmail,
  branchId,
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
          z-30 w-64 bg-white shadow-lg h-screen lg:h-auto
          mt-16 lg:mt-0
        `}
      >
        <div className="p-4">
          {/* Mobile User Info */}
          <div className="mb-6 sm:hidden">
            <p className="text-sm font-medium text-gray-900">
              {userName || "User"}
            </p>
            <p className="text-xs text-gray-500">{userEmail}</p>
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
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
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

          {/* Branch Info */}
          {branchId && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Current Branch</p>
              <div className="flex items-center">
                <span className="text-lg mr-2">🏢</span>
                <span className="text-sm font-medium text-gray-700">
                  Branch: {branchId}
                </span>
              </div>
            </div>
          )}
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
