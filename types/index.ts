export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "branch_user";
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
}

export interface Customer {
  id: string;
  type: "B2B" | "B2C";
  name: string;
  email: string;
  mobileNo: string;
  panNo?: string;
  telephoneNo?: string;
  whatsappNo?: string;
  dateOfBirth?: string;
  anniversaryDate?: string;
  addressLine1: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  // B2C specific fields
  companyName?: string;
  gstType?: string;
  gstin?: string;
  contactName?: string;
  contactNo?: string;
  contactEmail?: string;
  branchId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  itemCode: string;
  barcode: string;
  productName: string;
  unit: string;
  hsnCode: string;
  salesTax: number;
  shortDescription?: string;
  b2bSalePrice: number;
  b2cSalePrice: number;
  purchasePrice: number;
  branchId: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  captchaToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
  captchaToken: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
