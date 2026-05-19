import type { ImportModel } from "@/models/import"
import { api } from "@/services/api";
import { useEffect, useState } from "react"

export const useImports = () =>{
    const [imports,setImports] = useState<ImportModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        const fetchImports = async () =>{
        setLoading(true)
        try {
          const res  = await api.imports.getAll();
          setImports(res);
          console.log(res);
            
        } catch (error) {
            setError(error.message || "Failed to fetch Imports");
        }finally{
            setLoading(false)
        }
    }
    fetchImports();

    },[]);

    return {
        imports,
        loading,
        error,
        setImports
    }
}

export const deleteImport =async (id:number) =>{

    try {

        const res  = await api.imports.delete(id)
        console.log(res);
    } catch (error) {
          console.error(error.message || "Failed to delete Imports");
    }

}

export const updateImport =async (editingBatchId:number,dto:any) =>{

    try {
        const res  = await api.imports.update(editingBatchId,dto)
        console.log(res);
    } catch (error) {
          console.error(error.message || "Failed to delete Imports");
    }

}

export const createImport =async (dto:any) =>{

    try {
        const res  = await api.imports.create(dto)
        console.log(res);
    } catch (error) {
          console.error(error.message || "Failed to create Imports");
    }

} 