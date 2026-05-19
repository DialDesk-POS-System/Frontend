export interface SaleItemModel {
  id: number;

  saleId: number;
  sale: any | null;

  warranty: any | null;

  watchId: string;
  watch: any | null;

  unitPrice: number;
  costPrice: number;
  discountAmount: number;
  lineTotal: number;

  createdAt: string;
}