import axiosInstance from "./axios";

export interface Product {
  _id: string;
  userId: string;
  productName: string;
  itemCode?: string;
  barCode: string;
  unit: number;
  hsnCode?: string;
  salesTax: string;
  shortDescription?: string;
  b2bSalePrice: number;
  b2cSalePrice: number;
  purchasePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  productName: string;
  itemCode?: string;
  barCode: string;
  unit: number;
  hsnCode?: string;
  salesTax: string;
  shortDescription?: string;
  b2bSalePrice: number;
  b2cSalePrice: number;
  purchasePrice: number;
}

export type ProductFormData = CreateProductData;

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: string[];
}

// Get all products
export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
  try {
    const response = await axiosInstance.get("/products");
    return response.data;
  } catch (error) {
    console.error("Get products error:", error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (
  id: string,
): Promise<ApiResponse<Product>> => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get product by ID error:", error);
    throw error;
  }
};

// Create product
export const createProduct = async (
  data: CreateProductData,
): Promise<ApiResponse<Product>> => {
  try {
    const response = await axiosInstance.post("/products", data);
    return response.data;
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
};

// Update product
export const updateProduct = async (
  id: string,
  data: UpdateProductData,
): Promise<ApiResponse<Product>> => {
  try {
    const response = await axiosInstance.put(`/products/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};
