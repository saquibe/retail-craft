"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CustomerForm from "@/components/forms/CustomerForm";
import { FiEdit2, FiTrash2, FiPlus, FiUser } from "react-icons/fi";
import { useCustomers } from "@/lib/hooks/useCustomers";

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filter, setFilter] = useState("all");

  const {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers(filter);

  const handleSubmit = async (data) => {
    if (selectedCustomer) {
      await updateCustomer({ id: selectedCustomer._id, data });
    } else {
      await createCustomer(data);
    }
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(id);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const filteredCustomers =
    filter === "all"
      ? customers
      : customers.filter((c) => c.customerType === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="mb-6 flex space-x-2">
        <Button
          variant={filter === "all" ? "primary" : "secondary"}
          size="small"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "B2B" ? "primary" : "secondary"}
          size="small"
          onClick={() => setFilter("B2B")}
        >
          B2B
        </Button>
        <Button
          variant={filter === "B2C" ? "primary" : "secondary"}
          size="small"
          onClick={() => setFilter("B2C")}
        >
          B2C
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer._id} className="p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FiUser className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">{customer.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      customer.customerType === "B2B"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {customer.customerType}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(customer._id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span>{" "}
                {customer.email || "N/A"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Mobile:</span> {customer.mobileNo}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Location:</span> {customer.city},{" "}
                {customer.country}
              </p>
              {customer.customerType === "B2C" && (
                <p className="text-gray-600">
                  <span className="font-medium">Company:</span>{" "}
                  {customer.companyName}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        title={selectedCustomer ? "Edit Customer" : "Add New Customer"}
        size="large"
      >
        <CustomerForm
          initialData={selectedCustomer}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}
