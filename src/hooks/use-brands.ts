import { useEffect, useState } from "react";
import { api } from "@/services/api";

export const useBrands = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);

      try {
        const res = await api.brands.getActive();

        setBrands([
          "All brands",
          ...res.map((b: any) => b.name),
        ]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch brands");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    error,
  };
};