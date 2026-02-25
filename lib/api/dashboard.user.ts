// import { api } from "/api";
import { DashboardData } from "@/types/dashboard.types";

export const dashboardService = {
  async getDashboardData(branchId?: string) {
    const params = branchId ? { branchId } : {};
    // return api.get<DashboardData>("/dashboard", { params });
  },

  async getReceivables(branchId?: string) {
    const params = branchId ? { branchId } : {};
    // return api.get("/dashboard/receivables", { params });
  },

  async getPayables(branchId?: string) {
    const params = branchId ? { branchId } : {};
    // return api.get("/dashboard/payables", { params });
  },
};
