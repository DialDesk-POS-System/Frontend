import { api } from "@/services/api";
import { useEffect, useState } from "react"

export const useOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);

            try {
                const response = await api.sales.getAll();
                setOrders(response);
            } catch (error) {
                setError(error?.message || "Error fetching orders");
            } finally {
                setLoading(false);
            }
    }
    
    fetchOrders();
    }, []);
    
    return { orders, loading, error };
}