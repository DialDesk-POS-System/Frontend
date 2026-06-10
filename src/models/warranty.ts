export interface WarrantyDetailModel {
    // Warranty
    id: number;
    isClaimed: boolean;
    startDate: string;
    endDate: string;
    claimDate?: string | null;

    // SaleItem
    saleItemId: number;
    unitPrice: number;
    lineTotal: number;

    // Sale
    saleId: number;
    invoiceNo: string;
    saleDate: string;
    customerName?: string;
    customerPhone?: string;

    // Watch
    watchId: string;
    serialNo?: string;
    color?: string;

    // Model + Brand
    modelName: string;
    modelNo: string;
    brandName: string;
}