import { api } from "@/services/api";
import { useEffect, useState } from "react";

export interface Analytics {
  totalUnits: number;
  totalModels: number;
  lowStockCount: number;
  totalStockValue: number;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUnits: 0,
    totalModels: 0,
    lowStockCount: 0,
    totalStockValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      try {
        const totalUnits = await api.analytics.getTotalUnits();
        const totalModels = await api.analytics.getTotalModels();
        const lowStockCount = await api.analytics.getLowStockCount(5);
        const totalStockValue = await api.analytics.getTotalStockValue();
        setAnalytics({
          totalUnits,
          totalModels,
          lowStockCount,
          totalStockValue,
        });
        console.log(analytics);
      } catch (err: any) {
        setError(err.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
  };
};