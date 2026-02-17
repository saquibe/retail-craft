"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProductForm from "@/components/forms/ProductForm";
import { FiEdit2, FiTrash2, FiPlus, FiPackage } from "react-icons/fi";
import { useProducts } from "@/lib/hooks/useProducts";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { products, isLoading, createProduct, updateProduct, deleteProduct } =
    useProducts();

  const handleSubmit = async (data) => {
    if (selectedProduct) {
      await updateProduct({ id: selectedProduct._id, data });
    } else {
      await createProduct(data);
    }
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product._id} className="p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full">
                  <FiPackage className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">{product.productName}</h3>
                  <p className="text-xs text-gray-500">
                    Code: {product.itemCode || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Barcode:</span> {product.barcode}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Unit:</span> {product.unit}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">B2B Price</p>
                  <p className="font-semibold">₹{product.b2bSalePrice}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">B2C Price</p>
                  <p className="font-semibold">₹{product.b2cSalePrice}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        title={selectedProduct ? "Edit Product" : "Add New Product"}
        size="large"
      >
        <ProductForm
          initialData={selectedProduct}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}
