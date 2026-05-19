import type { SaleItemModel } from "./saleItem";

export interface ReturnModel {
  id: number;

  originalSaleItemId: number;

  originalSaleItem: SaleItemModel;

  newSaleItemId?: number | null;

  newSaleItem?: SaleItemModel | null;

  refundAmount: number;
  
  returnDate: string;
}