import axiosInstance from "./axios";
import { Branch } from "./branches";
import { Customer } from "./customers";

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

// A billing record returned from the server.  When the billing is completed the
// branchId and customerId fields are populated with full objects so that the
// frontend can render names/addresses.  During the draft stage the server may
// return only the _id strings, but those drafts are never used for printing.
export interface Billing {
  _id: string;
  userId: string;
  branchId: Branch; // populated object (not just id)
  customerId: Customer; // populated object (not just id)
  invoiceNumber: string;
  items: BillingItem[];
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  status: "Draft" | "Completed";
  createdAt: string;
  updatedAt: string;
  paymentMode?: string; // Added payment mode field
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
  paymentMode: string, // ADD THIS PARAMETER
): Promise<ApiResponse<Billing>> => {
  try {
    const response = await axiosInstance.post(
      `/billing/complete/${billingId}`,
      {
        paymentMode,
      },
    );
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

// =====================================================
// GET /api/billing/complete/all - Get all completed billings
// =====================================================
export const getCompletedBillings = async (): Promise<
  ApiResponse<Billing[]>
> => {
  try {
    const response = await axiosInstance.get("/billing/complete/all");
    return response.data;
  } catch (error) {
    console.error("Get completed billings error:", error);
    throw error;
  }
};
