import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { WatchModel } from "@/models/watch";
import { PaginatedResponse } from "@/services/pagination";

export type SearchGroupItem =
    | { type: "watch"; item: WatchModel }
    | { type: "model"; items: WatchModel[]; firstItem: WatchModel };

export const useSearch = (query: string, brand: string, activeCat: string) => {
    const [groupItems, setGroupItems] = useState<SearchGroupItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const pageSize = 5
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    
    useEffect(() => {
        const fetchSearchResult = async () => {
            setLoading(true);
            setError(null);
            try {
                const res: PaginatedResponse<SearchGroupItem> = await api.watches.search(query, brand, activeCat, page, pageSize);
                setGroupItems(res.items ?? []);
                setTotalPages(res.totalPages ?? 1);
                setTotalCount(res.totalCount ?? 0);
            } catch (error: any) {
                setError(error.message || "Failed to get search result");
            } finally {
                setLoading(false);
            }
        };

        const delay = setTimeout(fetchSearchResult, 500);
        return () => clearTimeout(delay)
    }, [query, brand, activeCat, page, pageSize]);

    return {
        groupItems,
        loading,
        error,
        page,
        pageSize,
        totalPages,
        totalCount,
        setPage
    }
}