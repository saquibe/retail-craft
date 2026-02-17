// lib/api/auth.ts
import axiosInstance from "./axios";

// Admin APIs
export const adminLogin = async (
  email: string,
  password: string,
  captchaToken: string,
) => {
  try {
    const response = await axiosInstance.post("/admin/login", {
      email,
      password,
      captchaToken,
    });
    return response.data;
  } catch (error) {
    console.error("Admin login API error:", error);
    throw error;
  }
};

export const adminLogout = async () => {
  try {
    const response = await axiosInstance.post("/admin/logout");
    return response.data;
  } catch (error) {
    console.error("Logout API error:", error);
    throw error;
  }
};

export const getAdminProfile = async () => {
  try {
    const response = await axiosInstance.get("/admin/profile");
    return response.data;
  } catch (error) {
    console.error("Get profile API error:", error);
    throw error;
  }
};

export const updateAdminProfile = async (data: any) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === "profilePicture" && data[key]) {
      formData.append("profilePicture", data[key]);
    } else {
      formData.append(key, data[key]);
    }
  });

  try {
    const response = await axiosInstance.put("/admin/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update profile API error:", error);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post("/admin/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Forgot password API error:", error);
    throw error;
  }
};

export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await axiosInstance.post(
      `/admin/reset-password/${token}`,
      {
        password,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Reset password API error:", error);
    throw error;
  }
};

// User APIs (to be implemented on backend)
export const userLogin = async (
  email: string,
  password: string,
  captchaToken: string,
) => {
  try {
    const response = await axiosInstance.post("/user/login", {
      email,
      password,
      captchaToken,
    });
    return response.data;
  } catch (error) {
    console.error("User login API error:", error);
    throw error;
  }
};
