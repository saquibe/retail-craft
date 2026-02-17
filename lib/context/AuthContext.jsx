"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  userLogin,
  userLogout,
  getUserProfile,
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
      } else if (token && userType) {
        // If no stored user but has token, fetch profile based on user type
        console.log(`checkAuth - fetching ${userType} profile`);
        try {
          let profile;
          if (userType === "admin") {
            profile = await getAdminProfile();
          } else {
            profile = await getUserProfile();
          }

          console.log("checkAuth - profile fetched:", profile);

          let userData;
          if (userType === "admin") {
            userData = {
              id: profile._id,
              email: profile.email,
              name: profile.contactName || profile.companyName || "Admin",
              contactName: profile.contactName,
              companyName: profile.companyName,
              type: "admin",
              profilePicture: profile.profilePicture,
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
              financialStartDate: profile.financialStartDate,
              financialEndDate: profile.financialEndDate,
            };
          } else {
            userData = {
              id: profile._id,
              email: profile.email,
              name: profile.name,
              type: "user",
              profilePicture: profile.profilePicture,
              branchId: profile.branchId?._id || profile.branchId,
              branchName: profile.branchId?.branchName,
              branchCode: profile.branchId?.branchCode,
            };
          }

          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error(`Failed to fetch ${userType} profile:`, error);
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
          const adminData = response.admin || response;
          userData = {
            id: adminData.id || adminData._id,
            email: adminData.email,
            name: adminData.contactName || adminData.companyName || "Admin",
            contactName: adminData.contactName,
            companyName: adminData.companyName,
            type: "admin",
            profilePicture: adminData.profilePicture,
            contactNumber: adminData.contactNumber,
            teliphoneNumber: adminData.teliphoneNumber,
            address: adminData.address,
            country: adminData.country,
            state: adminData.state,
            city: adminData.city,
            pincode: adminData.pincode,
            timeZone: adminData.timeZone,
            websiteLink: adminData.websiteLink,
            panNumber: adminData.panNumber,
            GstRegistrationType: adminData.GstRegistrationType,
            gstIn: adminData.gstIn,
            cinNumber: adminData.cinNumber,
            fssaiNumber: adminData.fssaiNumber,
            lutNumber: adminData.lutNumber,
            tanNumber: adminData.tanNumber,
            iecNumber: adminData.iecNumber,
          };
        } else {
          const userData_response = response.user || response;
          // Normalize branch information which may be returned as `branch`, `branchId`,
          // or nested objects with different id field names (`id` or `_id`).
          const branchObj =
            userData_response.branch || userData_response.branchId || null;
          const branchId =
            (userData_response.branch &&
              (userData_response.branch.id || userData_response.branch._id)) ||
            (userData_response.branchId &&
              (userData_response.branchId._id ||
                userData_response.branchId.id ||
                userData_response.branchId)) ||
            null;

          userData = {
            id: userData_response.id || userData_response._id,
            email: userData_response.email,
            name: userData_response.name,
            type: "user",
            profilePicture: userData_response.profilePicture,
            branchId: branchId,
            branchName:
              branchObj?.branchName || userData_response.branchName || null,
            branchCode:
              branchObj?.branchCode || userData_response.branchCode || null,
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
      const userType = localStorage.getItem("userType");
      if (userType === "admin") {
        await adminLogout();
      } else {
        await userLogout();
      }
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
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
