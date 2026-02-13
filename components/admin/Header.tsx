"use client";

import Link from "next/link";

interface HeaderProps {
  user?: {
    name?: string;
    email?: string;
  };
  onMenuClick: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  user,
  onMenuClick,
  onLogout,
}: HeaderProps) {
  return (
    <nav className="bg-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="text-indigo-100 hover:text-white lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/admin" className="flex items-center ml-4 lg:ml-0">
              <span className="text-white text-xl font-bold">
                RetailCraft Admin
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4 ml-10">
            <Link
              href="/admin"
              className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/branches"
              className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Branches
            </Link>
            <Link
              href="/admin/users"
              className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Users
            </Link>
            <Link
              href="/admin/reports"
              className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Reports
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center">
            <div className="mr-4 text-right hidden sm:block">
              <p className="text-sm font-medium text-indigo-100">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-indigo-200">{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
