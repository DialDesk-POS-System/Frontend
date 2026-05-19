import { useEffect, useState } from "react";
import { api } from "@/services/api";

export const useWarrenty = () =>{
    const [warrenty,setWarrenty] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{

        const fetchWarrenty = async () =>{
            setLoading(true);

            try {
                // const res = await api.warranty.get
                
            } catch (err: any) {
                setError(err.message || "Failed to fetch watches");
            }finally{
                setLoading(false);
            }
        }
    },[]);
}