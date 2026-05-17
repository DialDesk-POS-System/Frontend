import { Category } from "./enum";

export interface Model {
    id: number;

    modelNo: string;

    category: Category;

    brandId: number;
    brandName?: string;

    modelName: string;

    basePrice: number;
    description?: string;

    imageryUrl?: string;

    isActive: boolean;
}