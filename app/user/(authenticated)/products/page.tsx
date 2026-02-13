"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { Product, ApiResponse } from "@/types";
import { toast } from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    itemCode: "",
    barcode: "",
    productName: "",
    unit: "",
    hsnCode: "",
    salesTax: "",
    shortDescription: "",
    b2bSalePrice: "",
    b2cSalePrice: "",
    purchasePrice: "",
    branchId: user?.branchId || "",
  });

  const { loading, execute: fetchProducts } = useApi<Product[]>();
  const { execute: addProduct } = useApi<Product>();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const result = await fetchProducts(() =>
      apiClient.get<ApiResponse<Product[]>>(
        `/user/products?branchId=${user?.branchId}`,
      ),
    );
    if (result.success && result.data) {
      setProducts(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addProduct(() =>
      apiClient.post<ApiResponse<Product>>("/user/products", {
        ...formData,
        salesTax: parseFloat(formData.salesTax),
        b2bSalePrice: parseFloat(formData.b2bSalePrice),
        b2cSalePrice: parseFloat(formData.b2cSalePrice),
        purchasePrice: parseFloat(formData.purchasePrice),
      }),
    );

    if (result.success) {
      toast.success("Product added successfully");
      setShowAddModal(false);
      loadProducts();
      setFormData({
        itemCode: "",
        barcode: "",
        productName: "",
        unit: "",
        hsnCode: "",
        salesTax: "",
        shortDescription: "",
        b2bSalePrice: "",
        b2cSalePrice: "",
        purchasePrice: "",
        branchId: user?.branchId || "",
      });
    } else {
      toast.error(result.error || "Failed to add product");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Barcode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                B2B Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                B2C Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.barcode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{product.b2bSalePrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{product.b2cSalePrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{product.purchasePrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium mb-4">Add New Product</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Item Code
                  </label>
                  <input
                    type="text"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={(e) =>
                      setFormData({ ...formData, itemCode: e.target.value })
                    }
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Barcode *
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    required
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    required
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                    className="mt-1 block w-full border rounded-md p-2"
                  >
                    <option value="">Select Unit</option>
                    <option value="PCS">Pieces (PCS)</option>
                    <option value="KG">Kilogram (KG)</option>
                    <option value="LTR">Liter (LTR)</option>
                    <option value="MTR">Meter (MTR)</option>
                    <option value="BOX">Box (BOX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={(e) =>
                      setFormData({ ...formData, hsnCode: e.target.value })
                    }
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sales Tax (%) *
                  </label>
                  <input
                    type="number"
                    name="salesTax"
                    value={formData.salesTax}
                    onChange={(e) =>
                      setFormData({ ...formData, salesTax: e.target.value })
                    }
                    required
                    step="0.01"
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Short Description
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescription: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    B2B Sale Price *
                  </label>
                  <input
                    type="number"
                    name="b2bSalePrice"
                    value={formData.b2bSalePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, b2bSalePrice: e.target.value })
                    }
                    required
                    step="0.01"
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    B2C Sale Price *
                  </label>
                  <input
                    type="number"
                    name="b2cSalePrice"
                    value={formData.b2cSalePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, b2cSalePrice: e.target.value })
                    }
                    required
                    step="0.01"
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasePrice: e.target.value,
                      })
                    }
                    required
                    step="0.01"
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
