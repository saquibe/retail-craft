import axiosInstance from "./axios";

export interface BillingItem {
  productId: string;
  productName: string;
  barCode: string;
  quantity: number;
  price: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Billing {
  _id: string;
  userId: string;
  branchId: string;
  customerId: string;
  invoiceNumber: string;
  items: BillingItem[];
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  status: "Draft" | "Completed";
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// =====================================================
// POST /api/billing/create - Create new billing draft
// =====================================================
export const createBilling = async (
  customerId: string,
): Promise<ApiResponse<Billing>> => {
  try {
    const response = await axiosInstance.post("/billing/create", {
      customerId,
    });
    return response.data;
  } catch (error) {
    console.error("Create billing error:", error);
    throw error;
  }
};

// =====================================================
// POST /api/billing/add-product - Add product by barcode
// =====================================================
export const addProductToBilling = async (
  billingId: string,
  barCode: string,
  quantity: number,
): Promise<ApiResponse<Billing>> => {
  try {
    const response = await axiosInstance.post("/billing/add-product", {
      billingId,
      barCode,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Add product error:", error);
    throw error;
  }
};

// =====================================================
// POST /api/billing/remove-product - Remove product from billing
// =====================================================
export const removeProductFromBilling = async (
  billingId: string,
  productId: string,
): Promise<ApiResponse<Billing>> => {
  try {
    const response = await axiosInstance.post("/billing/remove-product", {
      billingId,
      productId,
    });
    return response.data;
  } catch (error) {
    console.error("Remove product error:", error);
    throw error;
  }
};

// =====================================================
// PUT /api/billing/update-quantity - Update product quantity
// =====================================================
export const updateProductQuantity = async (
  billingId: string,
  productId: string,
  quantity: number,
): Promise<ApiResponse<Billing>> => {
  try {
    const response = await axiosInstance.put("/billing/update-quantity", {
      billingId,
      productId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Update quantity error:", error);
    throw error;
  }
};

// =====================================================
// POST /api/billing/complete/:id - Complete billing
// =====================================================
export const completeBilling = async (
  billingId: string,
): Promise<ApiResponse<Billing>> => {
  try {
    const response = await axiosInstance.post(`/billing/complete/${billingId}`);
    return response.data;
  } catch (error) {
    console.error("Complete billing error:", error);
    throw error;
  }
};

// =====================================================
// GET /api/billing/:id - Get billing by ID
// =====================================================
export const getBillingById = async (
  billingId: string,
): Promise<ApiResponse<Billing>> => {
  try {
    const response = await axiosInstance.get(`/billing/${billingId}`);
    return response.data;
  } catch (error) {
    console.error("Get billing error:", error);
    throw error;
  }
};

// =====================================================
// DELETE /api/billing/:id - Delete billing
// =====================================================
export const deleteBilling = async (
  billingId: string,
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete(`/billing/${billingId}`);
    return response.data;
  } catch (error) {
    console.error("Delete billing error:", error);
    throw error;
  }
};
