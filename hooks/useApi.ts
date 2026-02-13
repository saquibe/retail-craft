import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types";

export const useApi = <T>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (apiCall: () => Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (response.success) {
        setData(response.data || null);
        return { success: true, data: response.data };
      } else {
        setError(response.error || "An error occurred");
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, execute };
};
