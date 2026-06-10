import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { PaginatedResponse } from "@/services/pagination";
import type { WarrantyDetailModel } from "@/models/warranty";

export type WarrantyStatus = "Active" | "Expiring" | "Expired" | "Claimed";

export interface WarrantyModel {
    id: number;
    saleItemId: number;
    invoiceNo: string;
    startDate: string;
    endDate: string;
    status?: string | null;
    claimDate?: string | null;


}

export const useWarrenty = () =>{
    const [warranties,setWarranties] = useState<WarrantyModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage]           = useState(1);
    const [pageSize]                = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

     const fetchWarrenty = async () =>{
            setLoading(true);

            try {
                const res:PaginatedResponse<WarrantyModel>  = await api.warranty.getPaginated(page,pageSize);
                setWarranties(res.items);
                console.log(res)
                setTotalPages(res.totalPages);
                setTotalCount(res.totalCount);
                
            } catch (err: any) {
                setError(err.message || "Failed to fetch warranties");
            }finally{
                setLoading(false);
            }
        }

    useEffect(()=>{

        fetchWarrenty();

        
    },[page]);

    return {
        warranties,
        loading,
        error,
        page,
        pageSize,
        totalPages,
        totalCount,
        setPage,
        refresh: fetchWarrenty 
    };
}


export const useWarrantyById = (id?: number) => {
    const [warranty, setWarranty] = useState<WarrantyDetailModel | null>(null);
    const [loading3, setLoading3]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    useEffect(() => {
        if (!id) return; 

        const fetch = async () => {
            setLoading3(true);
            try {
                const res = await api.warranty.getById(id);
                setWarranty(res);
                console.log(res)
            } catch (err: any) {
                setError(err.message || "Failed to fetch warranty");
            } finally {
                setLoading3(false);
            }
        };
        fetch();
    }, [id]); 

    return { warranty, loading3, error };
};