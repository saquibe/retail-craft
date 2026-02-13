"use client";

import { useState } from "react";
import { Customer } from "@/types";
import { apiClient } from "@/lib/api-client";
import { useApi } from "@/hooks/useApi";
import { toast } from "react-hot-toast";

interface CustomerFormProps {
  branchId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CustomerForm({
  branchId,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const [customerType, setCustomerType] = useState<"B2B" | "B2C">("B2B");
  const [formData, setFormData] = useState<any>({
    type: "B2B",
    branchId,
    name: "",
    email: "",
    mobileNo: "",
    panNo: "",
    telephoneNo: "",
    whatsappNo: "",
    dateOfBirth: "",
    anniversaryDate: "",
    addressLine1: "",
    addressLine2: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    // B2C fields
    companyName: "",
    gstType: "",
    gstin: "",
    contactName: "",
    contactNo: "",
    contactEmail: "",
  });

  const { loading, execute: saveCustomer } = useApi<Customer>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveCustomer(() =>
      apiClient.post("/user/customers", formData),
    );

    if (result.success) {
      toast.success("Customer added successfully");
      onSuccess();
    } else {
      toast.error(result.error || "Failed to add customer");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Customer Type
        </label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="B2B"
              checked={customerType === "B2B"}
              onChange={() => {
                setCustomerType("B2B");
                setFormData({ ...formData, type: "B2B" });
              }}
              className="form-radio"
            />
            <span className="ml-2">B2B</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="B2C"
              checked={customerType === "B2C"}
              onChange={() => {
                setCustomerType("B2C");
                setFormData({ ...formData, type: "B2C" });
              }}
              className="form-radio"
            />
            <span className="ml-2">B2C</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common fields for both B2B and B2C */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mobile No. *
          </label>
          <input
            type="tel"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            PAN No.
          </label>
          <input
            type="text"
            name="panNo"
            value={formData.panNo}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Telephone No.
          </label>
          <input
            type="tel"
            name="telephoneNo"
            value={formData.telephoneNo}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            WhatsApp No.
          </label>
          <input
            type="tel"
            name="whatsappNo"
            value={formData.whatsappNo}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Anniversary Date
          </label>
          <input
            type="date"
            name="anniversaryDate"
            value={formData.anniversaryDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address Line 1 *
          </label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address Line 2
          </label>
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select Country</option>
            <option value="India">India</option>
            {/* Add more countries */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            State *
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select State</option>
            <option value="Maharashtra">Maharashtra</option>
            {/* Add more states */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* B2C specific fields */}
        {customerType === "B2C" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                GST Type *
              </label>
              <select
                name="gstType"
                value={formData.gstType}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select GST Type</option>
                <option value="Regular">Regular</option>
                <option value="Composition">Composition</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                GSTIN *
              </label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Name
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact No.
              </label>
              <input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Customer"}
        </button>
      </div>
    </form>
  );
}
