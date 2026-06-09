import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { WatchModel } from "@/models/watch";
import { PaginatedResponse } from "@/services/pagination";


export const useWatches = () => {
  const [watches, setWatches] = useState<WatchModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 5
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchWatches = async () => {
      setLoading(true);

      try {
        const res: PaginatedResponse<WatchModel> = await api.watches.getAll(page, pageSize);
        console.log(res);
        setWatches(res.items);
        setTotalPages(res.totalPages);
        setTotalCount(res.totalCount);
      } catch (err: any) {
        setError(err.message || "Failed to fetch watches");
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, [page, pageSize]);

  return {
    watches,
    loading,
    error,
    page,
    pageSize,
    totalPages,
    totalCount,
    setPage
  };
};