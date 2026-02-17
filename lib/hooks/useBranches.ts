import { useState, useEffect } from "react";
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  Branch,
} from "@/lib/api/branches";
import { BranchFormData } from "@/components/forms/BranchForm";
import toast from "react-hot-toast";

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all branches
  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await getBranches();
      if (response.success && response.data) {
        setBranches(response.data);
      }
    } catch (error: any) {
      console.error("Fetch branches error:", error);
      setError(error.response?.data?.message || "Failed to fetch branches");
      toast.error("Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  // Create branch
  const createNewBranch = async (data: BranchFormData) => {
    try {
      const response = await createBranch(data);
      if (response.success) {
        toast.success("Branch created successfully!");
        await fetchBranches(); // Refresh the list
        return { success: true, data: response.data };
      }
    } catch (error: any) {
      console.error("Create branch error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create branch";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update branch
  const updateExistingBranch = async (
    id: string,
    data: Partial<BranchFormData>,
  ) => {
    try {
      const response = await updateBranch(id, data);
      if (response.success) {
        toast.success("Branch updated successfully!");
        await fetchBranches(); // Refresh the list
        return { success: true, data: response.data };
      }
    } catch (error: any) {
      console.error("Update branch error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update branch";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete branch
  const deleteExistingBranch = async (id: string) => {
    try {
      const response = await deleteBranch(id);
      if (response.success) {
        toast.success("Branch deleted successfully!");
        await fetchBranches(); // Refresh the list
        return { success: true };
      }
    } catch (error: any) {
      console.error("Delete branch error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete branch";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Load branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  return {
    branches,
    isLoading,
    error,
    fetchBranches,
    createBranch: createNewBranch,
    updateBranch: updateExistingBranch,
    deleteBranch: deleteExistingBranch,
  };
};
