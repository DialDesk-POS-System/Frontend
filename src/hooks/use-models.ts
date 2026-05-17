import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Model } from "@/models/model";

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);

      try {
        const res = await api.models.getActive();
        console.log(res);
        setModels(res);
      } catch (err: any) {
        setError(err.message || "Failed to fetch models");
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return {
    models,
    loading,
    error,
  };
}