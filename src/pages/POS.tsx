import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BillItem } from "@/data/mock";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Watch,
  Clock,
  Gem,
  Activity,
  Heart,
  LayoutGrid,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Send,
  Loader2,
  type LucideIcon,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/services/api";
import { categories } from "@/data/watchConstants";
import { WatchModel } from "@/models/watch";
import { useSearch, ExtraFilters } from "@/hooks/use-search";
import { useBrands } from "@/hooks/use-brands";
import { useModels } from "@/hooks/use-models";
import { goToPage, pageNumbers } from "@/services/pagination";

const iconMap: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  watch: Watch,
  clock: Clock,
  gem: Gem,
  activity: Activity,
  heart: Heart,
};

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash", icon: Banknote },
  { key: "credit_card", label: "Credit Card", icon: CreditCard },
  { key: "debit_card", label: "Debit Card", icon: CreditCard },
  { key: "bank_transfer", label: "Bank Transfer", icon: Building2 },
] as const;

const POS = () => {
  const [activeCat, setActiveCat] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All brands");
  const [query, setQuery] = useState("");
  const [bill, setBill] = useState<BillItem[]>([]);

  const [discountAmt, setDiscountAmt] = useState(0);
  const [taxAmt, setTaxAmt] = useState(0);

  const [billName, setBillName] = useState("");
  const [editingBillName, setEditingBillName] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [customerDetailsFilledOnce, setCustomerDetailsFilledOnce] = useState(false);

  const [sendPdf, setSendPdf] = useState(false);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [extraFilters, setExtraFilters] = useState<ExtraFilters>({});

  const [selectedModelGroup, setSelectedModelGroup] = useState<WatchModel[] | null>(null);
  const [popupFilters, setPopupFilters] = useState({
    serialNo: "",
    color: "",
    strapMaterial: "",
    category: "",
  });

  const { models, loading: modelsLoading } = useModels();
  const { brands, loading: brandsLoading } = useBrands();

  const {
    groupItems,
    loading: searchLoading,
    error: searchError,
    page,
    pageSize,
    totalPages,
    totalCount,
    setPage,
  } = useSearch(query, brand, activeCat, extraFilters);

  useEffect(() => {
    if (bill.length > 0 && !editingBillName) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
      const modelRef = bill[0]?.watch.modelNo?.slice(0, 6) || "WTC";
      setBillName(`SALE-${dateStr}-${timeStr}-${modelRef}`);
    } else if (bill.length === 0) {
      setBillName("");
      setEditingBillName(false);
    }
  }, [bill.length]);

  const subTotal = bill.reduce((s, b) => s + b.watch.sellingPrice * b.qty, 0);

  useEffect(() => {
    const taxable = Math.max(subTotal - discountAmt, 0);
    setTaxAmt(+(taxable * 0.05).toFixed(2));
  }, [subTotal, discountAmt]);

  const total = Math.max(subTotal - discountAmt + taxAmt, 0);

  const addToBill = (w: WatchModel) => {
    setBill((prev) => {
      const ex = prev.find((b) => b.watch.id === w.id);
      if (ex)
        return prev.map((b) =>
          b.watch.id === w.id ? { ...b, qty: b.qty + 1 } : b
        );
      return [...prev, { watch: w, qty: 1 }];
    });
    toast.success(`${w.modelName} added`);
  };

  const updateQty = (id: string, delta: number) =>
    setBill((prev) =>
      prev.flatMap((b) =>
        b.watch.id === id
          ? b.qty + delta <= 0
            ? []
            : [{ ...b, qty: b.qty + delta }]
          : [b]
      )
    );

  const remove = (id: string) =>
    setBill((prev) => prev.filter((b) => b.watch.id !== id));

  const pages = useMemo(
    () => pageNumbers(page, totalPages),
    [page, totalPages]
  );

  const handleDiscountChange = (val: string) => {
    const num = Math.max(0, +val || 0);
    if (num > subTotal) {
      toast.error("Discount cannot exceed subtotal");
      setDiscountAmt(subTotal);
    } else {
      setDiscountAmt(num);
    }
  };

  const handleConfirmPayment = () => {
    if (bill.length === 0) return toast.error("Bill is empty");
    if (!customerDetailsFilledOnce) {
      setShowCustomerModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleCustomerDone = () => {
    setCustomerDetailsFilledOnce(true);
    setShowCustomerModal(false);
  };

  const handleFinalConfirm = async () => {
    setSubmitting(true);
    try {
      const salePayload = {
        subTotal,
        discountAmount: discountAmt || null,
        taxAmount: taxAmt || null,
        totalAmount: total,
        paymentMethod,
        notes: notes || null,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        saleItems: bill.map((b) => ({
          watchId: b.watch.id,
          unitPrice: b.watch.sellingPrice,
          discountAmount: 0,
          lineTotal: b.watch.sellingPrice * b.qty,
        })),
      };

      const created = await api.sales.create(salePayload);

      if (sendPdf && customerEmail && created?.id) {
        try {
          await api.sales.sendEmail(created.id);
          toast.success(`Invoice email sent to ${customerEmail}`);
        } catch {
          toast.error("Sale completed but failed to send email");
        }
      }

      toast.success(`Sale completed! Invoice: ${created?.invoiceNo || "N/A"}`, {
        description: `Total: $${total.toFixed(2)}`,
      });

      setBill([]);
      setDiscountAmt(0);
      setTaxAmt(0);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setNotes("");
      setPaymentMethod("cash");
      setCustomerDetailsFilledOnce(false);
      setSendPdf(false);
      setShowConfirmModal(false);
      setBillName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete sale");
    } finally {
      setSubmitting(false);
    }
  };

  const popupFilteredItems = useMemo(() => {
    if (!selectedModelGroup) return [];
    return selectedModelGroup.filter(
      (w) =>
        (popupFilters.serialNo === "" ||
          w.serialNo
            ?.toLowerCase()
            .includes(popupFilters.serialNo.toLowerCase())) &&
        (popupFilters.color === "" || w.color === popupFilters.color) &&
        (popupFilters.strapMaterial === "" ||
          w.strapMaterial === popupFilters.strapMaterial) &&
        (popupFilters.category === "" ||
          w.category?.toString() === popupFilters.category)
    );
  }, [selectedModelGroup, popupFilters]);

  const paymentLabel = PAYMENT_METHODS.find((m) => m.key === paymentMethod)?.label || paymentMethod;

  return (
    <>
      <AppLayout>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
          {/* Left: catalogue */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="glass rounded-2xl flex items-center gap-2 px-4 h-12 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search watch model, brand, serial…"
                  className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
                />
              </div>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="glass rounded-2xl h-12 px-4 text-sm font-medium outline-none cursor-pointer"
              >
                <option value="All brands">All brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters((p) => !p)}
                className={cn(
                  "glass rounded-2xl h-12 w-12 grid place-items-center hover:shadow-glow transition-all",
                  showFilters && "gradient-primary text-primary-foreground shadow-glow"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Advanced Filter Panel */}
            {showFilters && (
              <div className="glass rounded-2xl p-4 mb-5 grid grid-cols-2 md:grid-cols-5 gap-3 animate-scale-in">
                <input
                  placeholder="Model Name"
                  value={extraFilters.modelName || ""}
                  onChange={(e) => setExtraFilters((p) => ({ ...p, modelName: e.target.value }))}
                  className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                />
                <input
                  placeholder="Model No"
                  value={extraFilters.modelNo || ""}
                  onChange={(e) => setExtraFilters((p) => ({ ...p, modelNo: e.target.value }))}
                  className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                />
                <input
                  placeholder="Serial No"
                  value={extraFilters.serialNo || ""}
                  onChange={(e) => setExtraFilters((p) => ({ ...p, serialNo: e.target.value }))}
                  className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                />
                <input
                  placeholder="Color"
                  value={extraFilters.color || ""}
                  onChange={(e) => setExtraFilters((p) => ({ ...p, color: e.target.value }))}
                  className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                />
                <input
                  placeholder="Strap Material"
                  value={extraFilters.strapMaterial || ""}
                  onChange={(e) => setExtraFilters((p) => ({ ...p, strapMaterial: e.target.value }))}
                  className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                />
              </div>
            )}

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
              {categories.map((c) => {
                const Icon = iconMap[c.icon];
                const active = activeCat === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setActiveCat(c.key)}
                    className={cn(
                      "shrink-0 rounded-2xl p-4 w-[130px] text-left transition-all duration-300",
                      active
                        ? "gradient-primary text-primary-foreground shadow-glow scale-[1.02]"
                        : "glass hover:shadow-soft"
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl grid place-items-center mb-3",
                        active ? "bg-white/20" : "bg-primary-soft text-primary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-sm">{c.label}</p>
                  </button>
                );
              })}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
              {searchLoading && (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading watches...
                </div>
              )}
              {searchError && (
                <div className="col-span-full py-8 text-center text-sm text-destructive">
                  {searchError}
                </div>
              )}

              {!searchLoading &&
                !searchError &&
                groupItems.map((group) => {
                  if (group.type === "watch") {
                    const w = group.item;
                    return (
                      <article
                        key={w.id}
                        className="glass rounded-3xl p-3 group hover:shadow-glow transition-all duration-500 animate-scale-in"
                      >
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-secondary">
                          <img
                            src={w.imageryUrl || "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"}
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"; }}
                            alt={w.modelName}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-lg glass-strong">
                            {!w.isSold ? "Available" : "Sold"}
                          </span>
                        </div>
                        <div className="px-1.5 pt-3 pb-1">
                          <p className="text-[11px] text-muted-foreground font-medium">
                            {w.brandName} · {w.modelName}
                          </p>
                          <h4 className="font-semibold text-sm mt-0.5 line-clamp-1">
                            {w.modelNo}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            SN: {w.serialNo}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-display font-bold text-primary">
                              ${w.sellingPrice?.toFixed(2)}
                            </span>
                            <button
                              onClick={() => addToBill(w)}
                              className="gradient-primary text-primary-foreground rounded-xl h-9 px-3 text-xs font-semibold shadow-glow hover:scale-105 transition-transform flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  } else {
                    const firstWatch = group.firstItem;
                    const actualModel = models.find(
                      (mod) => mod.id === firstWatch.modelId
                    );
                    const imageUrl =
                      actualModel?.imageryUrl || firstWatch.imageryUrl;

                    return (
                      <article
                        key={`model-${firstWatch.modelId}`}
                        className="glass rounded-3xl p-3 border border-primary/20 group hover:shadow-glow transition-all duration-500 animate-scale-in"
                      >
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-secondary">
                          <img
                            src={imageUrl || "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"}
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"; }}
                            alt={firstWatch.modelName}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-lg bg-primary text-primary-foreground shadow-glow">
                            {group.items.length} in stock
                          </span>
                        </div>
                        <div className="px-1.5 pt-3 pb-1">
                          <p className="text-[11px] text-muted-foreground font-medium">
                            {firstWatch.brandName} · {firstWatch.modelName}
                          </p>
                          <h4 className="font-semibold text-sm mt-0.5 line-clamp-1">
                            {firstWatch.modelNo}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Select a variant to add
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-display font-bold text-primary">
                              Models
                            </span>
                            <button
                              onClick={() => {
                                setSelectedModelGroup(group.items);
                                setPopupFilters({
                                  serialNo: "",
                                  color: "",
                                  strapMaterial: "",
                                  category: "",
                                });
                              }}
                              className="glass-strong text-foreground rounded-xl h-9 px-3 text-xs font-semibold shadow-soft hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1"
                            >
                              Select Watch
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                })}
              {!searchLoading && !searchError && groupItems.length === 0 && (
                <div className="col-span-full glass rounded-3xl p-12 text-center text-muted-foreground">
                  No watches match your filters.
                </div>
              )}

              {!searchLoading && !searchError && totalPages > 1 && (
                <div className="col-span-full flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1}–
                    {Math.min(page * pageSize, totalCount)} of {totalCount}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(page - 1, setPage, totalPages)}
                      disabled={page === 1}
                      className="h-8 w-8 rounded-xl glass-soft flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {pages.map((p, idx) => {
                      const prev = pages[idx - 1];
                      const showEllipsis = prev && p - prev > 1;
                      return (
                        <div key={p} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="text-xs text-muted-foreground px-1">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => goToPage(p, setPage, totalPages)}
                            className={`h-8 w-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all
                                                    ${
                                                      p === page
                                                        ? "gradient-primary text-primary-foreground shadow-glow"
                                                        : "glass-soft hover:shadow-glow"
                                                    }`}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => goToPage(page + 1, setPage, totalPages)}
                      disabled={page === totalPages}
                      className="h-8 w-8 rounded-xl glass-soft flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right: order panel */}
          <aside className="glass-strong rounded-3xl p-5 flex flex-col h-fit xl:sticky xl:top-3 xl:max-h-[calc(100vh-1.5rem)]">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {editingBillName ? (
                  <input
                    value={billName}
                    onChange={(e) => setBillName(e.target.value)}
                    onBlur={() => setEditingBillName(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingBillName(false)}
                    autoFocus
                    className="font-display text-lg font-bold bg-transparent outline-none border-b-2 border-primary w-full"
                  />
                ) : (
                  <h2 className="font-display text-xl font-bold truncate">
                    {billName || `Bill #DRAFT-${bill.length || 0}`}
                  </h2>
                )}
                <p className="text-xs text-muted-foreground">
                  Floyd Miles · Counter 1
                </p>
              </div>
              <button
                onClick={() => {
                  if (bill.length > 0) setEditingBillName(true);
                }}
                className="h-9 w-9 rounded-xl glass-soft grid place-items-center hover:shadow-soft"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 overflow-y-auto scrollbar-thin pr-1 flex-1 min-h-[120px] max-h-[340px]">
              {bill.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-10">
                  Cart is empty. Add a watch to start.
                </div>
              )}
              {bill.map((b) => {
                const actualModel = models.find((mod) => mod.id === b.watch.modelId);
                const imageUrl = b.watch.imageryUrl || actualModel?.imageryUrl || "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200";
                
                return (
                  <div
                    key={b.watch.id}
                    className="glass-soft rounded-2xl p-2.5 flex items-center gap-3"
                  >
                    <img
                      src={imageUrl}
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"; }}
                      alt={b.watch.modelName}
                      loading="lazy"
                      className="h-12 w-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {b.watch.modelName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {b.watch.modelName} · {b.watch.color}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-sm font-bold text-primary">
                          ${(b.watch.sellingPrice * b.qty).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(b.watch.id, -1)}
                            className="h-6 w-6 rounded-md bg-primary-soft text-primary grid place-items-center hover:scale-110 transition-transform"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {b.qty}
                          </span>
                          <button
                            onClick={() => updateQty(b.watch.id, 1)}
                            className="h-6 w-6 rounded-md gradient-primary text-primary-foreground grid place-items-center hover:scale-110 transition-transform"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => remove(b.watch.id)}
                            className="h-6 w-6 rounded-md text-muted-foreground hover:text-destructive grid place-items-center"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing */}
            <div className="glass-soft rounded-2xl p-4 mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  Discount $
                  <input
                    type="number"
                    min={0}
                    value={discountAmt || ""}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-20 h-6 rounded-md bg-background border border-border px-1.5 text-xs outline-none"
                  />
                </span>
                <span className="text-destructive">−${discountAmt.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  Tax $
                  <input
                    type="number"
                    min={0}
                    value={taxAmt || ""}
                    onChange={(e) => setTaxAmt(Math.max(0, +e.target.value || 0))}
                    placeholder="0.00"
                    className="w-20 h-6 rounded-md bg-background border border-border px-1.5 text-xs outline-none"
                  />
                </span>
                <span>${taxAmt.toFixed(2)}</span>
              </div>
              <div className="border-t border-border/60 my-2" />
              <div className="flex items-center justify-between">
                <span className="font-display font-bold">Total</span>
                <span className="font-display font-bold text-xl text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Send PDF checkbox */}
            <label 
              onClick={(e) => { e.preventDefault(); setSendPdf(!sendPdf); }}
              className="flex items-center gap-2 mt-3 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-md border-2 grid place-items-center transition-all shrink-0",
                  sendPdf
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border"
                )}
              >
                {sendPdf && <Check className="h-3 w-3" />}
              </div>
              <Send className="h-3.5 w-3.5" />
              Send PDF to customer email
            </label>

            {/* Customer details summary (after filling once) */}
            {customerDetailsFilledOnce && (
              <div className="glass-soft rounded-2xl p-3 mt-3 space-y-1 animate-scale-in">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Details</p>
                  <button
                    onClick={() => setShowCustomerModal(true)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {customerName && <p className="text-sm"><span className="text-muted-foreground">Name:</span> {customerName}</p>}
                {customerEmail && <p className="text-sm"><span className="text-muted-foreground">Email:</span> {customerEmail}</p>}
                {customerPhone && <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {customerPhone}</p>}
                <p className="text-sm"><span className="text-muted-foreground">Payment:</span> {paymentLabel}</p>
                {notes && <p className="text-sm text-muted-foreground truncate">Notes: {notes}</p>}
              </div>
            )}

            {/* Confirm Payment button */}
            <button
              onClick={handleConfirmPayment}
              disabled={submitting}
              className="mt-3 gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                `Confirm Payment · $${total.toFixed(2)}`
              )}
            </button>
          </aside>
        </div>
      </AppLayout>

      {/* Select Watch Modal */}
      {selectedModelGroup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onMouseDown={() => setSelectedModelGroup(null)}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-in shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display">
                  Select Watch Variant
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedModelGroup[0]?.brandName} ·{" "}
                  {selectedModelGroup[0]?.modelName}
                </p>
              </div>
              <button
                onClick={() => setSelectedModelGroup(null)}
                className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 bg-secondary/30 grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                placeholder="Search Serial No..."
                value={popupFilters.serialNo}
                onChange={(e) =>
                  setPopupFilters((p) => ({ ...p, serialNo: e.target.value }))
                }
                className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
              />
              <select
                value={popupFilters.category}
                onChange={(e) =>
                  setPopupFilters((p) => ({ ...p, category: e.target.value }))
                }
                className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
              >
                <option value="">All Categories</option>
                {Array.from(
                  new Set(
                    selectedModelGroup
                      .map((w) => w.category?.toString())
                      .filter(Boolean)
                  )
                ).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={popupFilters.color}
                onChange={(e) =>
                  setPopupFilters((p) => ({ ...p, color: e.target.value }))
                }
                className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
              >
                <option value="">All Colors</option>
                {Array.from(
                  new Set(
                    selectedModelGroup.map((w) => w.color).filter(Boolean)
                  )
                ).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={popupFilters.strapMaterial}
                onChange={(e) =>
                  setPopupFilters((p) => ({
                    ...p,
                    strapMaterial: e.target.value,
                  }))
                }
                className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
              >
                <option value="">All Straps</option>
                {Array.from(
                  new Set(
                    selectedModelGroup
                      .map((w) => w.strapMaterial)
                      .filter(Boolean)
                  )
                ).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {popupFilteredItems.map((w) => (
                <div
                  key={w.id}
                  className="glass rounded-2xl p-3 flex items-center justify-between group hover:shadow-soft transition-all"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      SN: {w.serialNo || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {w.color || "No Color"} · {w.strapMaterial || "No Strap"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">
                      ${w.sellingPrice?.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        addToBill(w);
                        setSelectedModelGroup(null);
                      }}
                      disabled={w.isSold}
                      className={cn(
                        "h-8 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1",
                        w.isSold
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "gradient-primary text-primary-foreground shadow-glow hover:scale-105"
                      )}
                    >
                      {w.isSold ? "Sold" : "Add"}
                    </button>
                  </div>
                </div>
              ))}
              {popupFilteredItems.length === 0 && (
                <div className="col-span-full py-10 text-center text-muted-foreground text-sm">
                  No variants match these filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onMouseDown={() => setShowCustomerModal(false)}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-scale-in shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display">Customer Details</h2>
                <p className="text-sm text-muted-foreground">Fill in customer info and select payment method</p>
              </div>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Name</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 w-full h-11 rounded-xl px-4 text-sm outline-none bg-background border border-border focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1 w-full h-11 rounded-xl px-4 text-sm outline-none bg-background border border-border focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="mt-1 w-full h-11 rounded-xl px-4 text-sm outline-none bg-background border border-border focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                  className="mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none bg-background border border-border focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setPaymentMethod(m.key)}
                      className={cn(
                        "rounded-2xl py-3 flex flex-col items-center gap-1.5 transition-all border-2",
                        paymentMethod === m.key
                          ? "gradient-primary text-primary-foreground border-primary shadow-glow"
                          : "glass-soft border-transparent hover:border-primary/30"
                      )}
                    >
                      <m.icon className="h-5 w-5" />
                      <span className="text-xs font-semibold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border/50">
              <button
                onClick={handleCustomerDone}
                className="w-full gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow hover:scale-[1.02] transition-transform"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onMouseDown={() => !submitting && setShowConfirmModal(false)}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-scale-in shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border/50">
              <h2 className="text-xl font-bold font-display">Confirm Sale</h2>
              <p className="text-sm text-muted-foreground">Review the details below and confirm</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Bill info */}
              <div className="glass-soft rounded-2xl p-3">
                <p className="text-xs text-muted-foreground font-semibold">Bill</p>
                <p className="font-bold">{billName || "Draft"}</p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Items ({bill.length})</p>
                {bill.map((b) => (
                  <div key={b.watch.id} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{b.watch.modelName} × {b.qty}</span>
                    <span className="font-bold">${(b.watch.sellingPrice * b.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="glass-soft rounded-2xl p-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Discount</span><span className="text-destructive">−${discountAmt.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>${taxAmt.toFixed(2)}</span></div>
                <div className="border-t border-border/60 my-1" />
                <div className="flex justify-between font-bold"><span>Total</span><span className="text-primary text-lg">${total.toFixed(2)}</span></div>
              </div>

              {/* Customer */}
              <div className="glass-soft rounded-2xl p-3 space-y-1 text-sm">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Customer</p>
                <p><span className="text-muted-foreground">Name:</span> {customerName || "Walk-in"}</p>
                {customerEmail && <p><span className="text-muted-foreground">Email:</span> {customerEmail}</p>}
                {customerPhone && <p><span className="text-muted-foreground">Phone:</span> {customerPhone}</p>}
                <p><span className="text-muted-foreground">Payment:</span> {paymentLabel}</p>
                {sendPdf && customerEmail && (
                  <p className="text-primary text-xs mt-1">📧 Invoice will be emailed to {customerEmail}</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-border/50 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="flex-1 glass-soft rounded-2xl h-12 font-semibold hover:shadow-soft transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalConfirm}
                disabled={submitting}
                className="flex-1 gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Confirm Sale"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default POS;
