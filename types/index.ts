// User types
export interface BaseUser {
  id: string;
  email: string;
  name?: string;
  contactName?: string;
  companyName?: string;
  profilePicture?: string;
}

export interface AdminUser extends BaseUser {
  type: "admin";
  contactNumber?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  timeZone?: string;
}

export interface AppUser extends BaseUser {
  type: "user";
  branchId?: string;
  role?: string;
}

export type User = AdminUser | AppUser;

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Branch types
export interface Branch {
  _id: string;
  branchName: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  timeZone: string;
  branchCode: string;
  branchGstNumber: string;
  createdAt: string;
  updatedAt: string;
}

// Customer types
export interface BaseCustomer {
  _id?: string;
  name: string;
  email?: string;
  mobileNo: string;
  panNo?: string;
  telephoneNo?: string;
  whatsAppNo?: string;
  dateOfBirth?: string;
  anniversaryDate?: string;
  addressLine1?: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
}

export interface B2BCustomer extends BaseCustomer {
  customerType: "B2B";
}

export interface B2CCustomer extends BaseCustomer {
  customerType: "B2C";
  companyName: string;
  gstType: string;
  gstin: string;
  contactName?: string;
  contactNo?: string;
  contactEmail?: string;
}

export type Customer = B2BCustomer | B2CCustomer;

// Product types
export interface Product {
  _id?: string;
  itemCode?: string;
  barcode: string;
  productName: string;
  unit: string;
  hsnCode?: string;
  salesTax: string;
  shortDescription?: string;
  b2bSalePrice: string;
  b2cSalePrice: string;
  purchasePrice: string;
  createdAt?: string;
  updatedAt?: string;
}
