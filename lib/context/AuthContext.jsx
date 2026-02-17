"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  userLogin,
} from "../api/auth";
import toast from "react-hot-toast";

// Export the context so it can be imported directly
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthProvider mounted");
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log("checkAuth started");
    try {
      const token = Cookies.get("accessToken");
      const userType = localStorage.getItem("userType");
      const storedUser = localStorage.getItem("user");

      console.log(
        "checkAuth - token:",
        !!token,
        "userType:",
        userType,
        "storedUser:",
        !!storedUser,
      );
      console.log("Current path:", window.location.pathname);

      if (token && userType && storedUser) {
        // If we have stored user data, use it
        const userData = JSON.parse(storedUser);
        console.log("checkAuth - userData from storage:", userData);
        setUser(userData);
      } else if (token && userType === "admin") {
        // If no stored user but has token, fetch profile
        console.log("checkAuth - fetching admin profile");
        try {
          const profile = await getAdminProfile();
          console.log("checkAuth - profile fetched:", profile);
          const userData = {
            id: profile._id,
            email: profile.email,
            name: profile.contactName || profile.companyName || "Admin",
            contactName: profile.contactName,
            companyName: profile.companyName,
            type: "admin",
            profilePicture: profile.profilePicture,
            // Include other fields as needed
            contactNumber: profile.contactNumber,
            teliphoneNumber: profile.teliphoneNumber,
            address: profile.address,
            country: profile.country,
            state: profile.state,
            city: profile.city,
            pincode: profile.pincode,
            timeZone: profile.timeZone,
            websiteLink: profile.websiteLink,
            panNumber: profile.panNumber,
            GstRegistrationType: profile.GstRegistrationType,
            gstIn: profile.gstIn,
            cinNumber: profile.cinNumber,
            fssaiNumber: profile.fssaiNumber,
            lutNumber: profile.lutNumber,
            tanNumber: profile.tanNumber,
            iecNumber: profile.iecNumber,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          logout();
        }
      } else {
        console.log("checkAuth - no valid auth found");
        // Clear any invalid data
        if (token) Cookies.remove("accessToken", { path: "/" });
        localStorage.removeItem("userType");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
      console.log("checkAuth completed, loading set to false");
    }
  };

  const login = async (email, password, captchaToken, type = "admin") => {
    console.log("login function called with type:", type);
    try {
      let response;
      if (type === "admin") {
        response = await adminLogin(email, password, captchaToken);
      } else {
        response = await userLogin(email, password, captchaToken);
      }

      console.log("Login response:", response);

      if (response.accessToken) {
        console.log("Access token received, setting cookies and storage");

        // Set cookie with proper options
        Cookies.set("accessToken", response.accessToken, {
          expires: 7,
          sameSite: "strict",
          path: "/",
        });

        localStorage.setItem("userType", type);

        // Create user object based on response structure
        let userData;
        if (type === "admin") {
          userData = {
            id: response.admin?.id || response.admin?._id,
            email: response.admin?.email,
            name:
              response.admin?.contactName ||
              response.admin?.companyName ||
              "Admin",
            contactName: response.admin?.contactName,
            companyName: response.admin?.companyName,
            type: "admin",
            profilePicture: response.admin?.profilePicture,
            contactNumber: response.admin?.contactNumber,
            teliphoneNumber: response.admin?.teliphoneNumber,
            address: response.admin?.address,
            country: response.admin?.country,
            state: response.admin?.state,
            city: response.admin?.city,
            pincode: response.admin?.pincode,
            timeZone: response.admin?.timeZone,
            websiteLink: response.admin?.websiteLink,
            panNumber: response.admin?.panNumber,
            GstRegistrationType: response.admin?.GstRegistrationType,
            gstIn: response.admin?.gstIn,
            cinNumber: response.admin?.cinNumber,
            fssaiNumber: response.admin?.fssaiNumber,
            lutNumber: response.admin?.lutNumber,
            tanNumber: response.admin?.tanNumber,
            iecNumber: response.admin?.iecNumber,
          };
        } else {
          userData = {
            id: response.user?.id || response.user?._id,
            email: response.user?.email,
            name: response.user?.name || response.user?.contactName || "User",
            type: "user",
            branchId: response.user?.branchId,
            profilePicture: response.user?.profilePicture,
          };
        }

        console.log("Setting user data:", userData);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        toast.success("Login successful!");

        // Use window.location for hard redirect
        console.log("Redirecting to dashboard with window.location");

        if (type === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/user/dashboard";
        }

        return { success: true };
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    console.log("logout called");
    try {
      await adminLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      Cookies.remove("accessToken", { path: "/" });
      localStorage.removeItem("userType");
      localStorage.removeItem("user");
      setUser(null);

      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  // Add updateUser function
  const updateUser = (updatedData) => {
    console.log("Updating user with:", updatedData);
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser, // Make sure to include this
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
