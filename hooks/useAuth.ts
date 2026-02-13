import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { LoginCredentials, User, ApiResponse } from "@/types";

export const useAuth = () => {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  const login = async (
    credentials: LoginCredentials,
    role: "admin" | "user",
  ) => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ user: User; token: string }>
      >(`/auth/${role}/login`, credentials);

      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        apiClient.setToken(response.data.token);
        router.push(role === "admin" ? "/admin" : "/user");
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logoutUser = () => {
    logout();
    apiClient.clearToken();
    router.push("/");
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout: logoutUser,
  };
};
