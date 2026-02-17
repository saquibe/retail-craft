"use client";

import { useAuth } from "@/lib/context/AuthContext";
import Card from "@/components/ui/Card";
import { FiUsers, FiPackage, FiShoppingCart } from "react-icons/fi";

export default function UserDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      name: "Total Customers",
      value: "0",
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      name: "Total Products",
      value: "0",
      icon: FiPackage,
      color: "bg-green-500",
    },
    {
      name: "Total Orders",
      value: "0",
      icon: FiShoppingCart,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Customers</h2>
          <p className="text-gray-500 text-center py-4">
            No customers added yet
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Products</h2>
          <p className="text-gray-500 text-center py-4">
            No products added yet
          </p>
        </Card>
      </div>
    </div>
  );
}
