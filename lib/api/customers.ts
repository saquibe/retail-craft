import axiosInstance from "./axios";

export const getCustomers = async (type) => {
  const response = await axiosInstance.get(
    `/customers${type ? `?type=${type}` : ""}`,
  );
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await axiosInstance.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data) => {
  const response = await axiosInstance.post("/customers", data);
  return response.data;
};

export const updateCustomer = async (id, data) => {
  const response = await axiosInstance.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axiosInstance.delete(`/customers/${id}`);
  return response.data;
};
