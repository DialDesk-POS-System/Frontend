import { api } from "@/services/api";
import { useEffect, useState } from "react"

export const useSales = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const response = await api.sales.getAll();
                setSales(response);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        console.log(sales)
        fetchSales();
    }, []);

    return {
        sales,
        loading,
        error,
    };
}