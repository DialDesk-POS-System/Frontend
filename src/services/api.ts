import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';
  
const client = axios.create({
    baseURL:API_BASE_URL,
    headers:{
        "Content-Type":"application/json"
    }
})

const qs = (params: Record<string, string | number | boolean | null | undefined>) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        search.set(key, String(value));
    }
    const str = search.toString();
    return str ? `?${str}` : "";
};

const handleError = (error: unknown): never => {
    if (error instanceof AxiosError) {
        const data = error.response?.data;

        // Validation errors (422)
        if (data?.errors && typeof data.errors === "object") {
            const validationErrors = Object.entries(data.errors)
                .map(([field, messages]: [string, any]) => {
                    const msgArray = Array.isArray(messages)
                        ? messages
                        : [messages];
                    return `${field}: ${msgArray.join(", ")}`;
                })
                .join("; ");
            const errorMsg = data.title
                ? `${data.title}. ${validationErrors}`
                : validationErrors;
            throw new Error(errorMsg);
        }

        // General API errors
        const errorMsg =
            data?.message ||
            data?.error ||
            data?.title ||
            `HTTP error! status: ${error.response?.status}`;
        throw new Error(errorMsg);
    }

    // Unknown errors
    throw new Error("An unexpected error occurred. Please try again.");
};

const apiRequest = async <T = any> (
    method:"get" | "post" | "put" | "delete",
    endpoint:string,
    data?:unknown
): Promise<T> =>{
    try {
     
        const res = await client[method]<T>(endpoint,data);
        return res.data;
        
    } catch (error) {
        console.log(`failed ${error}`);
        return handleError(error);
    }
}

export const api = {

    brands: {
        getAll:    async () =>
            apiRequest<any[]>("get", `/Brand`),
        getById:   async (id: number) =>
            apiRequest<any>("get", `/Brand/${id}`),
        search:    async (name: string) =>
            apiRequest<any[]>("get", `/Brand/search${qs({ name })}`),
        getActive: async () =>
            apiRequest<any[]>("get", `/Brand/active`),
        create:    async (dto: any) =>
            apiRequest<any>("post", `/Brand`, dto),
        update:    async (id: number, dto: any) =>
            apiRequest<any>("put", `/Brand/${id}`, dto),
        delete:    async (id: number) =>
            apiRequest<void>("delete", `/Brand/${id}`),
    },


    imports: {
        getAll:   async () =>
            apiRequest<any[]>("get", `/BulkImport`),
        getById:  async (id: number) =>
            apiRequest<any>("get", `/BulkImport/${id}`),
        create:   async (dto: any) =>
            apiRequest<any>("post", `/BulkImport`, dto),
        update:   async (id: number, dto: any) =>
            apiRequest<void>("put", `/BulkImport/${id}`, dto),
        delete:   async (id: number) =>
            apiRequest<void>("delete", `/BulkImport/${id}`),
        getBySupplier: async (supplier: string) =>
            apiRequest<any>("get", `/BulkImport/supplier/${encodeURIComponent(supplier)}`),
        getByDateRange: async (from: string | Date, to: string | Date) => {
            const fromStr = from instanceof Date ? from.toISOString() : from;
            const toStr   = to   instanceof Date ? to.toISOString()   : to;
            return apiRequest<any[]>("get", `/BulkImport/daterange${qs({ from: fromStr, to: toStr })}`);
        },
    },


    inventory: {
        getAll:          async () =>
            apiRequest<any[]>("get", `/InventoryLogs`),
        getById:         async (id: number) =>
            apiRequest<any>("get", `/InventoryLogs/${id}`),
        getByWatchId:    async (watchId: string) =>
            apiRequest<any[]>("get", `/InventoryLogs/watch/${watchId}`),
        getByChangeType: async (changeType: string | number) =>
            apiRequest<any[]>("get", `/InventoryLogs/changeType/${String(changeType)}`),
        create:          async (dto: any) =>
            apiRequest<any>("post", `/InventoryLogs`, dto),
        delete:          async (id: number) =>
            apiRequest<void>("delete", `/InventoryLogs/${id}`),
    },


    models: {
        getAll:    async () =>
            apiRequest<any[]>("get", `/Model`),
        getById:   async (id: number) =>
            apiRequest<any>("get", `/Model/${id}`),
        search:    async (modelNo: string) =>
            apiRequest<any[]>("get", `/Model/search${qs({ modelNo })}`),
        getByBrand: async (brandId: number) =>
            apiRequest<any[]>("get", `/Model/by-brand/${brandId}`),
        getActive: async () =>
            apiRequest<any[]>("get", `/Model/active`),
        create:    async (dto: any) =>
            apiRequest<any>("post", `/Model`, dto),
        update:    async (id: number, dto: any) =>
            apiRequest<any>("put", `/Model/${id}`, dto),
        delete:    async (id: number) =>
            apiRequest<void>("delete", `/Model/${id}`),
    },

    modelPriceHistory: {
        getAll:     async () =>
            apiRequest<any[]>("get", `/ModelPriceHistory`),
        getById:    async (id: number) =>
            apiRequest<any>("get", `/ModelPriceHistory/${id}`),
        getByModel: async (modelId: number) =>
            apiRequest<any[]>("get", `/ModelPriceHistory/by-model/${modelId}`),
        search:     async (filter: any) =>
            apiRequest<any[]>("post", `/ModelPriceHistory/search`, filter),
        create:     async (dto: any) =>
            apiRequest<any>("post", `/ModelPriceHistory`, dto),
        update:     async (id: number, dto: any) =>
            apiRequest<any>("put", `/ModelPriceHistory/${id}`, dto),
        delete:     async (id: number) =>
            apiRequest<void>("delete", `/ModelPriceHistory/${id}`),
    },


    returns: {
        getAll:        async () =>
            apiRequest<any[]>("get", `/Return`),
        getById:       async (id: number) =>
            apiRequest<any>("get", `/Return/${id}`),
        getBySaleItem: async (saleItemId: number) =>
            apiRequest<any>("get", `/Return/sale/${saleItemId}`),
        create:        async (dto: any) =>
            apiRequest<any>("post", `/Return`, dto),
        update:        async (id: number, dto: any) =>
            apiRequest<void>("put", `/Return/${id}`, dto),
        delete:        async (id: number) =>
            apiRequest<void>("delete", `/Return/${id}`),
    },

    sales: {
        getAll:       async () =>
            apiRequest<any[]>("get", `/Sale`),
        getById:      async (id: number) =>
            apiRequest<any>("get", `/Sale/${id}`),
        getByInvoice: async (invoiceNo: string) =>
            apiRequest<any>("get", `/Sale/by-invoice/${encodeURIComponent(invoiceNo)}`),
        search:       async (filter: any) =>
            apiRequest<any[]>("post", `/Sale/search`, filter),
        create:       async (dto: any) =>
            apiRequest<any>("post", `/Sale`, dto),
        update:       async (id: number, dto: any) =>
            apiRequest<any>("put", `/Sale/${id}`, dto),
        delete:       async (id: number) =>
            apiRequest<void>("delete", `/Sale/${id}`),
    },

    saleItems: {
        getAll:      async () =>
            apiRequest<any[]>("get", `/SaleItem`),
        getById:     async (id: number) =>
            apiRequest<any>("get", `/SaleItem/${id}`),
        getBySaleId: async (saleId: number) =>
            apiRequest<any[]>("get", `/SaleItem/sale/${saleId}`),
        create:      async (dto: any) =>
            apiRequest<any>("post", `/SaleItem`, dto),
        update:      async (id: number, dto: any) =>
            apiRequest<any>("put", `/SaleItem/${id}`, dto),
        delete:      async (id: number) =>
            apiRequest<void>("delete", `/SaleItem/${id}`),
    },


    warranty: {
        getById:        async (id: number) =>
            apiRequest<any>("get", `/Warranty/${id}`),
        getBySaleItemId: async (saleItemId: number) =>
            apiRequest<any>("get", `/Warranty/sale/${saleItemId}`),
        getByWatchId:   async (watchId: string) =>
            apiRequest<any>("get", `/Warranty/watch/${watchId}`),
        create:         async (dto: any) =>
            apiRequest<any>("post", `/Warranty`, dto),
        claim: async (warrantyId: number, claimDate: string | Date) => {
            const claimDateStr = claimDate instanceof Date
                ? claimDate.toISOString()
                : claimDate;
            return apiRequest<void>(
                "put",
                `/Warranty/claim/${warrantyId}${qs({ claimDate: claimDateStr })}`
            );
        },
        delete: async (warrantyId: number) =>
            apiRequest<void>("delete", `/Warranty/${warrantyId}`),
    },


    watches: {
        getAll:    async () =>
            apiRequest<any[]>("get", `/Watch`),
        getById:   async (id: string) =>
            apiRequest<any>("get", `/Watch/${id}`),
        getByModel: async (modelId: number) =>
            apiRequest<any[]>("get", `/Watch/by-model/${modelId}`),
        getBySerial: async (serialNumber: string) =>
            apiRequest<any>("get", `/Watch/by-serial/${encodeURIComponent(serialNumber)}`),
        getByStatus: async (status: string | number) =>
            apiRequest<any[]>("get", `/Watch/by-status/${String(status)}`),
        getByCostPriceRange: async (min: number, max: number) =>
            apiRequest<any[]>("get", `/Watch/by-cost-price${qs({ min, max })}`),
        getBySellingPriceRange: async (min: number, max: number) =>
            apiRequest<any[]>("get", `/Watch/by-selling-price${qs({ min, max })}`),
        create: async (dto: any) =>
            apiRequest<any>("post", `/Watch`, dto),
        update: async (id: string, dto: any) =>
            apiRequest<any>("put", `/Watch/${id}`, dto),
        delete: async (id: string) =>
            apiRequest<void>("delete", `/Watch/${id}`),
        search: async(filter:any)=>
            apiRequest<any[]>("get",`/Watch/search${qs(filter)}`),
    },
};