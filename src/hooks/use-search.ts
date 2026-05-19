import { api } from "@/services/api";
import { useEffect, useState } from "react"

export const useSearch = (query: string, brand: string, activeCat: string) => {
    const [groupItems, setGroupItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSearchResult = async () => {
            setLoading(true);
            try {
                const res = await api.watches.search(query, brand, activeCat);
                setGroupItems(res); 
            } catch (error: any) {
                setError(error.message || "Failed to get search result");
            } finally {
                setLoading(false);
            }
        };

        const delay = setTimeout(fetchSearchResult, 500);
        return () => clearTimeout(delay)
    }, [query, brand, activeCat]);

    return {
        groupItems,
        loading,
        error,
    }
}