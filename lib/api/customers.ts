import axiosInstance from "./axios";

export interface Customer {
  _id: string;
  userId: string;
  customerType: "B2B" | "B2C";
  name: string;
  email?: string;
  mobile?: string;
  country: string;
  state: string;
  city: string;

  // B2B specific fields
  companyName?: string;
  GstRegistrationType?: string;
  gstIn?: string;
  contactName?: string;
  contactNumber?: string;
  contactEmail?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  customerType: "B2B" | "B2C";
  name: string;
  email?: string;
  mobile?: string;
  country: string;
  state: string;
  city: string;

  // B2B specific fields
  companyName?: string;
  GstRegistrationType?: string;
  gstIn?: string;
  contactName?: string;
  contactNumber?: string;
  contactEmail?: string;
}

// Export this as the form data type
export type CustomerFormData = CreateCustomerData;

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: string[];
}

// Get all customers
export const getCustomers = async (): Promise<ApiResponse<Customer[]>> => {
  try {
    const response = await axiosInstance.get("/customers");
    return response.data;
  } catch (error) {
    console.error("Get customers error:", error);
    throw error;
  }
};

// Get customer by ID
export const getCustomerById = async (
  id: string,
): Promise<ApiResponse<Customer>> => {
  try {
    const response = await axiosInstance.get(`/customers/single/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get customer by ID error:", error);
    throw error;
  }
};

// Create customer
export const createCustomer = async (
  data: CreateCustomerData,
): Promise<ApiResponse<Customer>> => {
  try {
    const response = await axiosInstance.post("/customers", data);
    return response.data;
  } catch (error) {
    console.error("Create customer error:", error);
    throw error;
  }
};

// Update customer
export const updateCustomer = async (
  id: string,
  data: UpdateCustomerData,
): Promise<ApiResponse<Customer>> => {
  try {
    const response = await axiosInstance.put(`/customers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update customer error:", error);
    throw error;
  }
};

// Delete customer
export const deleteCustomer = async (
  id: string,
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete customer error:", error);
    throw error;
  }
};
