import { api } from "@/services/api";
import { useEffect, useState } from "react";

export interface Analytics {
  totalUnits: number;
  totalModels: number;
  lowStockModels: any;
  totalStockValue: number;
  todayRevenue: number;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUnits: 0,
    totalModels: 0,
    lowStockModels: [],
    totalStockValue: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      try {
        const today = new Date();

        const totalUnits = await api.analytics.getTotalUnits();
        const totalModels = await api.analytics.getTotalModels();
        const lowStockModels = await api.analytics.getLowStockModels();
        const totalStockValue = await api.analytics.getTotalStockValue();
        const todayRevenue = await api.analytics.getTodayRevenue(today);

        setAnalytics({
          totalUnits,
          totalModels,
          lowStockModels,
          totalStockValue,
          todayRevenue,
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