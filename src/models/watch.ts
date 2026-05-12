import { Category, Status } from "./enum";

export interface WatchModel {
    id: string;
    modelId: number;

    modelName: string;
    brandName: string;
    category: Category;

    serialNo?: string;
    color?: string;
    strapMaterial?: string;

    waterResistanceM?: number;

    costPrice: number;
    sellingPrice: number;

    status: Status;
    imageryUrl?: string;

    receivedAt: string;
    updatedAt: string;

    isSold: boolean;
    hasWarranty: boolean;
}