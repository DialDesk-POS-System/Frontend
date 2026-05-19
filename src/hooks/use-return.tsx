import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { ReturnModel } from "@/models/return";

export const useReturn = () =>{
    const [returns, setReturns]= useState<ReturnModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{

        const fetchWarrenty = async () =>{
            setLoading(true);

            try {
                 const res = await api.returns.getAll();
                console.log(res);
                setReturns(res)
                
            } catch (err: any) {
                setError(err.message || "Failed to fetch watches");
            }finally{
                setLoading(false);
            }
        }
         fetchWarrenty();
    },[]);

    return {
    returns,
    loading,
    error,
    setReturns,
  };
}