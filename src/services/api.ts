const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';
  
const qs = (params: Record<string, string | number | boolean | null | undefined>) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        search.set(key, String(value));
    }
    const str = search.toString();
    return str ? `?${str}` : "";
};

const json = (body: unknown): RequestInit => ({
    body: JSON.stringify(body),
});

const apiRequest = async <T= any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
    };

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

        let data: any;
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            const text = await res.text();
            data = text ? { message: text } : { message: `HTTP error! status: ${res.status}` };
        }

        if (!res.ok) {
            if (data.errors && typeof data.errors === 'object') {
                const validationErrors = Object.entries(data.errors)
                    .map(([field, messages]: [string, any]) => {
                        const msgArray = Array.isArray(messages) ? messages : [messages];
                        return `${field}: ${msgArray.join(", ")}`;
                    })
                    .join("; ")
                const errorMsg = data.title
                ? `${data.title}. ${validationErrors}`
                : validationErrors;
                throw new Error(JSON.stringify(errorMsg));
            }
            const errorMsg = data.message || data.error || data.title || `HTTP error! status: ${res.status}`;
            throw new Error(JSON.stringify(errorMsg));
        }

        return data;
    } catch (error) {
        console.error("API request failed.", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
};

export const api = {
    brands: {
        getall: async () => apiRequest<any[]>(`/Brand`),
        getById: async (id: number) => apiRequest<any>(`/Brand/${id}`),
        search: async (name: string) => apiRequest<any[]>(`/Brand/search${qs({ name })}`),
        getActive: async () => apiRequest<any[]>(`/Brand/active`),
        create: async (dto: any) => apiRequest<any>(`/Brand`, { method: "POST", ...json(dto) }),
        update: async (id: number, dto: any) => apiRequest<any>(`/Brand/${id}`, { method: "PUT", ...json(dto) }),
        delete: async (id: number) => apiRequest<void>(`/Brand/${id}`, { method: "DELETE" }),
    },

    imports: {
        create: async (bulkImport: any) => apiRequest<any>(`/BulkImport`, { method: "POST", ...json(bulkImport) }),
        getById: async (id: number) => apiRequest<any>(`/BulkImport/${id}`),
        getAll: async () => apiRequest<any[]>(`/BulkImport`),
        update: async (id: number, bulkImport: any) => apiRequest<void>(`/BulkImport/${id}`, { method: "PUT", ...json(bulkImport) }),
        delete: async (id: number) => apiRequest<void>(`/BulkImport/${id}`, { method: "DELETE" }),
        getBySupplier: async (supplier: string) => apiRequest<any>(`/BulkImport/supplier/${encodeURIComponent(supplier)}`),
        getByDateRange: async (from: string | Date, to: string | Date) => {
            const fromStr = from instanceof Date ? from.toISOString() : from;
            const toStr = to instanceof Date ? to.toISOString() : to;
            return apiRequest<any[]>(`/BulkImport/daterange${qs({ from: fromStr, to: toStr })}`);
        },
    },

    inventory: {
        create: async (log: any) => apiRequest<any>(`/InventoryLogs`, { method: "POST", ...json(log) }),
        getById: async (id: number) => apiRequest<any>(`/InventoryLogs/${id}`),
        getAll: async () => apiRequest<any[]>(`/InventoryLogs`),
        getByWatchId: async (watchId: string) => apiRequest<any[]>(`/InventoryLogs/watch/${watchId}`),
        getByChangeType: async (changeType: string | number) => apiRequest<any[]>(`/InventoryLogs/changeType/${String(changeType)}`),
        delete: async (id: number) => apiRequest<void>(`/InventoryLogs/${id}`, { method: "DELETE" }),
    },

    models: {
        getAll: async () => apiRequest<any[]>(`/Model`),
        getById: async (id: number) => apiRequest<any>(`/Model/${id}`),
        search: async (modelNo: string) => apiRequest<any[]>(`/Model/search${qs({ modelNo })}`),
        getByBrand: async (brandId: number) => apiRequest<any[]>(`/Model/by-brand/${brandId}`),
        getActive: async () => apiRequest<any[]>(`/Model/active`),
        create: async (dto: any) => apiRequest<any>(`/Model`, { method: "POST", ...json(dto) }),
        update: async (id: number, dto: any) => apiRequest<any>(`/Model/${id}`, { method: "PUT", ...json(dto) }),
        delete: async (id: number) => apiRequest<void>(`/Model/${id}`, { method: "DELETE" }),
    },

    modelPriceHistory: {
        getAll: async () => apiRequest<any[]>(`/ModelPriceHistory`),
        getById: async (id: number) => apiRequest<any>(`/ModelPriceHistory/${id}`),
        getByModel: async (modelId: number) => apiRequest<any[]>(`/ModelPriceHistory/by-model/${modelId}`),
        search: async (filter: any) => apiRequest<any[]>(`/ModelPriceHistory/search`, { method: "POST", ...json(filter) }),
        create: async (dto: any) => apiRequest<any>(`/ModelPriceHistory`, { method: "POST", ...json(dto) }),
        update: async (id: number, dto: any) => apiRequest<any>(`/ModelPriceHistory/${id}`, { method: "PUT", ...json(dto) }),
        delete: async (id: number) => apiRequest<void>(`/ModelPriceHistory/${id}`, { method: "DELETE" }),
    },

    returns: {
        getAll: async () => apiRequest<any[]>(`/Return`),
        getById: async (id: number) => apiRequest<any>(`/Return/${id}`),
        getBySaleItem: async (saleItemId: number) => apiRequest<any>(`/Return/sale/${saleItemId}`),
        create: async (dto: any) => apiRequest<any>(`/Return`, { method: "POST", ...json(dto) }),
        update: async (id: number, dto: any) => apiRequest<void>(`/Return/${id}`, { method: "PUT", ...json(dto) }),
        delete: async (id: number) => apiRequest<void>(`/Return/${id}`, { method: "DELETE" }),
    },

    sales: {
        getAll: async () => apiRequest<any[]>(`/Sale`),
        getById: async (id: number) => apiRequest<any>(`/Sale/${id}`),
        getByInvoice: async (invoiceNo: string) => apiRequest<any>(`/Sale/by-invoice/${encodeURIComponent(invoiceNo)}`),
        search: async (filter: any) => apiRequest<any[]>(`/Sale/search`, { method: "POST", ...json(filter) }),
        create: async (dto: any) => apiRequest<any>(`/Sale`, { method: "POST", ...json(dto) }),
        update: async (id: number, dto: any) => apiRequest<any>(`/Sale/${id}`, { method: "PUT", ...json(dto) }),
        delete: async (id: number) => apiRequest<void>(`/Sale/${id}`, { method: "DELETE" }),
    },

    slaeItems: {
        getAll: async () => apiRequest<any[]>(`/SaleItem`),
        getById: async (id: number) => apiRequest<any>(`/SaleItem/${id}`),
        getBySaleId: async (saleId: number) => apiRequest<any[]>(`/SaleItem/sale/${saleId}`),
        create: async (dto: any) => apiRequest<any>(`/SaleItem`, { method: "POST", ...json(dto) }),
        update: async (id: number, dto: any) => apiRequest<any>(`/SaleItem/${id}`, { method: "PUT", ...json(dto) }),
        delete: async (id: number) => apiRequest<void>(`/SaleItem/${id}`, { method: "DELETE" }),
    },

    warranty: {
        getById: async (id: number) => apiRequest<any>(`/Warranty/${id}`),
        create: async (dto: any) => apiRequest<any>(`/Warranty`, { method: "POST", ...json(dto) }),
        getBySaleItemId: async (saleItemId: number) => apiRequest<any>(`/Warranty/sale/${saleItemId}`),
        getByWatchId: async (watchId: string) => apiRequest<any>(`/Warranty/watch/${watchId}`),
        claim: async (warrantyId: number, claimDate: string | Date) => {
            const claimDateStr = claimDate instanceof Date ? claimDate.toISOString() : claimDate;
            return apiRequest<void>(`/Warranty/claim/${warrantyId}${qs({ claimDate: claimDateStr })}`, { method: "PUT" });
        },
        delete: async (warrantyId: number) => apiRequest<void>(`/Warranty/${warrantyId}`, { method: "DELETE" }),
    },

    watches: {
        getAll: async () => apiRequest<any[]>(`/Watch`),
        getById: async (id: string) => apiRequest<any>(`/Watch/${id}`),
        getByModel: async (modelId: number) => apiRequest<any[]>(`/Watch/by-model/${modelId}`),
        getBySerial: async (serialNumber: string) => apiRequest<any>(`/Watch/by-serial/${encodeURIComponent(serialNumber)}`),
        getByStatus: async (status: string | number) => apiRequest<any[]>(`/Watch/by-status/${String(status)}`),
        getByCostPriceRange: async (min: number, max: number) => apiRequest<any[]>(`/Watch/by-cost-price${qs({ min, max })}`),
        getBySellingPriceRange: async (min: number, max: number) => apiRequest<any[]>(`/Watch/by-selling-price${qs({ min, max })}`),
        create: async (dto: any) => apiRequest<any>(`/Watch`, { method: "POST", ...json(dto) }),
        update: async (id: string, dto: any) => apiRequest<any>(`/Watch/${id}`, { method: "PUT", ...json(dto) }),
        delete: async (id: string) => apiRequest<void>(`/Watch/${id}`, { method: "DELETE" }),
    },
}