import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        // Ensure user has type property
        const userWithType = {
          ...user,
          type: user.type || (user as any).role === "admin" ? "admin" : "user",
        } as User;

        set({
          user: userWithType,
          token,
          isAuthenticated: true,
        });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        // Clear any stored tokens
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
