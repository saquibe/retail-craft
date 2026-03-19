import axiosInstance from "./axios";

export interface PurchaseItem {
  productId: string;
  productName: string;
  barCode: string;
  quantity: number;
  purchasePrice: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PurchaseInvoice {
  _id: string;
  userId: string;
  branchId: {
    _id: string;
    branchName: string;
    branchPhoneNumber: string;
    address: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
    branchCode: string;
    branchGstNumber: string;
  };
  supplierId: {
    _id: string;
    name: string;
    email?: string;
    mobile?: string;
    address: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
    gstIn: string;
  };
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  reverseCharge: string;
  items: PurchaseItem[];
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  status: "Draft" | "Completed";
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseData {
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  reverseCharge: string;
}

export interface AddProductData {
  purchaseId: string;
  barCode: string;
  quantity: number;
}

export interface UpdateQuantityData {
  purchaseId: string;
  productId: string;
  quantity: number;
}

export interface RemoveProductData {
  purchaseId: string;
  productId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: string[];
}

// =====================================================
// POST /api/purchase-invoice/create - Create purchase invoice
// =====================================================
export const createPurchase = async (
  data: CreatePurchaseData,
): Promise<ApiResponse<PurchaseInvoice>> => {
  try {
    const response = await axiosInstance.post("/purchase-invoice/create", data);
    return response.data;
  } catch (error) {
    console.error("Create purchase error:", error);
    throw error;
  }
};

// =====================================================
// POST /api/purchase-invoice/add-product - Add product by barcode
// =====================================================
export const addProductToPurchase = async (
  data: AddProductData,
): Promise<ApiResponse<PurchaseInvoice>> => {
  try {
    const response = await axiosInstance.post(
      "/purchase-invoice/add-product",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Add product to purchase error:", error);
    throw error;
  }
};

// =====================================================
// POST /api/purchase-invoice/remove-product - Remove product from purchase
// =====================================================
export const removeProductFromPurchase = async (
  data: RemoveProductData,
): Promise<ApiResponse<PurchaseInvoice>> => {
  try {
    const response = await axiosInstance.post(
      "/purchase-invoice/remove-product",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Remove product from purchase error:", error);
    throw error;
  }
};

// =====================================================
// PUT /api/purchase-invoice/update-quantity - Update product quantity
// =====================================================
export const updatePurchaseQuantity = async (
  data: UpdateQuantityData,
): Promise<ApiResponse<PurchaseInvoice>> => {
  try {
    const response = await axiosInstance.put(
      "/purchase-invoice/update-quantity",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Update purchase quantity error:", error);
    throw error;
  }
};

// =====================================================
// POST /api/purchase-invoice/complete/:id - Complete purchase invoice
// =====================================================
export const completePurchase = async (
  id: string,
): Promise<ApiResponse<PurchaseInvoice>> => {
  try {
    const response = await axiosInstance.post(
      `/purchase-invoice/complete/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Complete purchase error:", error);
    throw error;
  }
};

// =====================================================
// GET /api/purchase-invoice/:id - Get purchase by ID
// =====================================================
export const getPurchaseById = async (
  id: string,
): Promise<ApiResponse<PurchaseInvoice>> => {
  try {
    const response = await axiosInstance.get(`/purchase-invoice/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get purchase by ID error:", error);
    throw error;
  }
};

// =====================================================
// DELETE /api/purchase-invoice/:id - Delete purchase invoice
// =====================================================
export const deletePurchase = async (
  id: string,
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete(`/purchase-invoice/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete purchase error:", error);
    throw error;
  }
};

// =====================================================
// GET /api/purchase-invoice/complete/all - Get all completed purchase invoices
// =====================================================
export const getCompletedPurchases = async (): Promise<
  ApiResponse<PurchaseInvoice[]>
> => {
  try {
    const response = await axiosInstance.get("/purchase-invoice/complete/all");
    return response.data;
  } catch (error) {
    console.error("Get completed purchases error:", error);
    throw error;
  }
};
