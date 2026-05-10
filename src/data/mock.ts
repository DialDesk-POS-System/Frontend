import watch1 from "@/assets/watch-1.jpg";
import watch2 from "@/assets/watch-2.jpg";
import watch3 from "@/assets/watch-3.jpg";
import watch4 from "@/assets/watch-4.jpg";
import watch5 from "@/assets/watch-5.jpg";
import watch6 from "@/assets/watch-6.jpg";

export type WatchCategory = "All" | "Hand Watch" | "Clock" | "Smart" | "Luxury" | "Sports" | "Womens";

export interface WatchModel {
  id: string;
  name: string;
  modelNo: string;
  brand: string;
  category: Exclude<WatchCategory, "All">;
  price: number;
  cost: number;
  image: string;
  stock: number;
  warrantyMonths: number;
  strap: string;
  color: string;
  discountPct?: number;
  tag?: "New" | "Hot" | "Sale";
}

export const brands = ["Casio", "Seiko", "Citizen", "Rolex", "Omega", "Tissot"];

export const categories: { key: WatchCategory; label: string; icon: string; count: number }[] = [
  { key: "All", label: "All", icon: "grid", count: 235 },
  { key: "Hand Watch", label: "Hand Watch", icon: "watch", count: 142 },
  { key: "Clock", label: "Clock", icon: "clock", count: 38 },
  { key: "Luxury", label: "Luxury", icon: "gem", count: 24 },
  { key: "Sports", label: "Sports", icon: "activity", count: 19 },
  { key: "Womens", label: "Womens", icon: "heart", count: 12 },
];

export const watches: WatchModel[] = [
  { id: "w1", name: "Crown Classic Leather", modelNo: "CR-1842", brand: "Citizen", category: "Hand Watch", price: 189.99, cost: 110, image: watch1, stock: 14, warrantyMonths: 24, strap: "Black Leather", color: "Silver", tag: "Hot" },
  { id: "w2", name: "Aurum Gold Bracelet", modelNo: "AU-2210", brand: "Seiko", category: "Luxury", price: 459.0, cost: 280, image: watch2, stock: 6, warrantyMonths: 36, strap: "Gold Steel", color: "Gold", discountPct: 15, tag: "Sale" },
  { id: "w3", name: "Trail Pro Digital", modelNo: "TR-5500", brand: "Casio", category: "Sports", price: 129.5, cost: 70, image: watch3, stock: 22, warrantyMonths: 24, strap: "Silicone", color: "Black/Green", tag: "New" },
  { id: "w4", name: "Heritage Wall Clock", modelNo: "HW-1100", brand: "Tissot", category: "Clock", price: 79.0, cost: 35, image: watch4, stock: 9, warrantyMonths: 12, strap: "—", color: "Walnut" },
  { id: "w5", name: "Rosé Diamond Series", modelNo: "RD-3380", brand: "Omega", category: "Womens", price: 689.0, cost: 410, image: watch5, stock: 3, warrantyMonths: 36, strap: "Rose Gold Steel", color: "Rose Gold", tag: "Hot" },
  { id: "w6", name: "Neo Desk Clock", modelNo: "ND-220", brand: "Casio", category: "Clock", price: 59.99, cost: 24, image: watch6, stock: 18, warrantyMonths: 12, strap: "—", color: "Matte Black" },
];

export interface BillItem {
  watch: WatchModel;
  qty: number;
}

export const sampleBatches = [
  { id: "B-2025-014", supplier: "Tokyo Time Co.", date: "2025-04-12", units: 48, value: 12480 },
  { id: "B-2025-013", supplier: "Geneva Imports", date: "2025-03-28", units: 22, value: 18650 },
  { id: "B-2025-012", supplier: "Pacific Watches", date: "2025-03-15", units: 65, value: 9800 },
  { id: "B-2025-011", supplier: "Tokyo Time Co.", date: "2025-02-22", units: 31, value: 7240 },
];

export const recentSales = [
  { invoice: "INV-2025-00142", customer: "Floyd Miles", items: 2, total: 648.99, method: "Card", time: "10:24" },
  { invoice: "INV-2025-00141", customer: "Walk-in", items: 1, total: 129.5, method: "Cash", time: "09:58" },
  { invoice: "INV-2025-00140", customer: "Arlene McCoy", items: 3, total: 1230.0, method: "Bank", time: "09:31" },
  { invoice: "INV-2025-00139", customer: "Jacob Jones", items: 1, total: 459.0, method: "Card", time: "09:12" },
];

export const lowStockAlerts = [
  { model: "Rosé Diamond Series", modelNo: "RD-3380", stock: 3, threshold: 5 },
  { model: "Aurum Gold Bracelet", modelNo: "AU-2210", stock: 6, threshold: 8 },
];

export const salesTrend = [
  { d: "Mon", v: 1240 }, { d: "Tue", v: 1890 }, { d: "Wed", v: 1520 },
  { d: "Thu", v: 2310 }, { d: "Fri", v: 2780 }, { d: "Sat", v: 3120 }, { d: "Sun", v: 2450 },
];
