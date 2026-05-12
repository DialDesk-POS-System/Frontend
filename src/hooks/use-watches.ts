import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { WatchModel } from "@/models/watch";

export const useWatches = () => {
  const [watches, setWatches] = useState<WatchModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatches = async () => {
      setLoading(true);

      try {
        const res = await api.watches.getAll();
        console.log(res);
        setWatches(res);
      } catch (err: any) {
        setError(err.message || "Failed to fetch watches");
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  return {
    watches,
    loading,
    error,
    setWatches,
  };
};