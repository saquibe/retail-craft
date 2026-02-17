"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User as UserIcon, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Name:</span>
              <span>{user?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Email:</span>
              <span>{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Branch Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Branch Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.branchName ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Branch:</span>
                  <span>{user.branchName}</span>
                </div>
                {user.branchCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium ml-6">Code:</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {user.branchCode}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">No branch assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
