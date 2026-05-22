import { useEffect, useState } from "react";
import { api } from "@/services/api";

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

export interface PaginatedWarranty {
    items: WarrantyModel[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export const useWarrenty = () =>{
    const [warranties,setWarranties] = useState<WarrantyModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage]           = useState(1);
    const [pageSize]                = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);


    useEffect(()=>{

        const fetchWarrenty = async () =>{
            setLoading(true);

            try {
                const res:PaginatedWarranty  = await api.warranty.getPaginated(page,pageSize);
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

        fetchWarrenty();

        
    },[page]);

    const goToPage = (p: number) => {
                if (p < 1 || p > totalPages) return;
                setPage(p);
    };

    return {
        warranties,
        loading,
        error,
        page,
        pageSize,
        totalPages,
        totalCount,
        goToPage,
    };
}