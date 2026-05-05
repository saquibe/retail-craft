// lib/api/public.ts
import axiosInstance from "./axios";

export interface PublicInvoice {
  _id: string;
  invoiceNumber: string;
  customerId: {
    name: string;
    mobile: string;
    email?: string;
  };
  branchId: {
    branchName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    branchPhoneNumber: string;
    branchGstNumber: string;
  };
  items: Array<{
    productName: string;
    itemCode: string;
    quantity: number;
    price: number;
    taxPercent: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  discountAmount?: number;
  finalTotal: number;
  freightCharge?: number;
  paymentMode?: string;
  paymentStatus?: string;
  createdAt: string;
}

export const getPublicInvoice = async (
  invoiceNumber: string,
): Promise<{ success: boolean; data?: PublicInvoice; message?: string }> => {
  try {
    const response = await axiosInstance.get(
      `/public-invoice?invoiceNumber=${invoiceNumber}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Get public invoice error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to load invoice",
    };
  }
};
