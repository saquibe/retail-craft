// lib/hooks/useRealtimeDashboard.ts
import { useEffect, useCallback } from "react";
import { useDashboard } from "./useDashboard";

export const useRealtimeDashboard = () => {
  const { refresh, dashboardData } = useDashboard();

  const handleNewBilling = useCallback(
    (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_BILLING" || data.type === "NEW_PURCHASE") {
        refresh();
      }
    },
    [refresh],
  );

  useEffect(() => {
    // Setup WebSocket connection for real-time updates
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",
    );

    ws.onmessage = handleNewBilling;
    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => {
      ws.close();
    };
  }, [handleNewBilling]);

  return { dashboardData };
};
