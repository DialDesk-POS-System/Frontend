import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BillItem } from "@/data/mock";
import { Search, SlidersHorizontal, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Printer, Send, Watch, Clock, Gem, Activity, Heart, LayoutGrid, Edit3, X, Rss } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/services/api";
import { categories } from "@/data/watchConstants";
import { WatchModel } from "@/models/watch";
import { useWatches } from "@/hooks/use-watches";

const iconMap: Record<string, any> = { grid: LayoutGrid, watch: Watch, clock: Clock, gem: Gem, activity: Activity, heart: Heart };

type OrderType = "Dine in" | "Take Away" | "Delivery";

const POS = () => {
  const [activeCat, setActiveCat] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All brands");
  const [brands, setBrands] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [bill, setBill] = useState<BillItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("Dine in");
  const [discountPct, setDiscountPct] = useState(0);
  
  const { watches, loading, error } = useWatches();
  
  const filtered = useMemo(() => {
    return watches.filter(w =>
      (activeCat === "All" || w.category === activeCat) &&
      (brand === "All brands" || w.brandName === brand) &&
      (
        query === "" || 
        (
          `${w.modelName} ${w.serialNo ?? ""} ${w.brandName}`
          .toLowerCase()
          .includes(query.toLowerCase())
        )
      )
    );
  }, [watches, activeCat, brand, query]);

  const addToBill = (w: WatchModel) => {
    setBill(prev => {
      const ex = prev.find(b => b.watch.id === w.id);
      if (ex) return prev.map(b => b.watch.id === w.id ? { ...b, qty: b.qty + 1 } : b);
      return [...prev, { watch: w, qty: 1 }];
    });
    toast.success(`${w.modelName} added`);
  };
  const updateQty = (id: string, delta: number) =>
    setBill(prev => prev.flatMap(b => b.watch.id === id ? (b.qty + delta <= 0 ? [] : [{ ...b, qty: b.qty + delta }]) : [b]));
  const remove = (id: string) => setBill(prev => prev.filter(b => b.watch.id !== id));

  const subTotal = bill.reduce((s, b) => s + b.watch.sellingPrice * b.qty, 0);
  const discount = subTotal * (discountPct / 100);
  const tax = (subTotal - discount) * 0.05;
  const total = subTotal - discount + tax;

  const handlePay = (method: string) => {
    if (bill.length === 0) return toast.error("Bill is empty");
    const inv = `INV-2025-${String(Math.floor(Math.random() * 900) + 143).padStart(5, "0")}`;
    toast.success(`Payment confirmed (${method})`, { description: `Invoice ${inv} · $${total.toFixed(2)}` });
    setBill([]);
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
        {/* Left: catalogue */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="glass rounded-2xl flex items-center gap-2 px-4 h-12 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search watch model, brand, serial…"
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={brand}
              onChange={e => setBrand(e.target.value)}
              className="glass rounded-2xl h-12 px-4 text-sm font-medium outline-none cursor-pointer"
            >
              <option>All brands</option>
              {brands.map(b => <option key={b}>{b}</option>)}
            </select>
            <button className="glass rounded-2xl h-12 w-12 grid place-items-center hover:shadow-glow transition-shadow">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
            {categories.map(c => {
              const Icon = iconMap[c.icon];
              const active = activeCat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCat(c.key)}
                  className={cn(
                    "shrink-0 rounded-2xl p-4 w-[130px] text-left transition-all duration-300",
                    active ? "gradient-primary text-primary-foreground shadow-glow scale-[1.02]" : "glass hover:shadow-soft"
                  )}
                >
                  <div className={cn("h-10 w-10 rounded-xl grid place-items-center mb-3", active ? "bg-white/20" : "bg-primary-soft text-primary")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-sm">{c.label}</p>
                  {/* <p className={cn("text-[11px] mt-0.5", active ? "text-primary-foreground/80" : "text-muted-foreground")}>{c.count} items</p> */}
                </button>
              );
            })}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
            {filtered.map(w => (
              <article key={w.id} className="glass rounded-3xl p-3 group hover:shadow-glow transition-all duration-500 animate-scale-in">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-secondary">
                  <img src={w.imageryUrl} alt={w.modelName} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {/* {w.tag && (
                    <span className={cn(
                      "absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-lg",
                      w.tag === "Sale" ? "bg-warning text-warning-foreground" : w.tag === "New" ? "gradient-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                    )}>{w.tag === "Sale" ? `${w.discountPct}% OFF` : w.tag}</span>
                  )} */}
                  <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-lg glass-strong">{w.isSold ? "Sold" : "Available"}</span>
                </div>
                <div className="px-1.5 pt-3 pb-1">
                  <p className="text-[11px] text-muted-foreground font-medium">{w.brandName} · {w.modelName}</p>
                  {/* <h4 className="font-semibold text-sm mt-0.5 line-clamp-1">{w.name}</h4> */}
                  <p className="text-[11px] text-muted-foreground mt-0.5">{w.color} · {w.strapMaterial}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-display font-bold text-primary">${w.sellingPrice.toFixed(2)}</span>
                    <button
                      onClick={() => addToBill(w)}
                      className="gradient-primary text-primary-foreground rounded-xl h-9 px-3 text-xs font-semibold shadow-glow hover:scale-105 transition-transform flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full glass rounded-3xl p-12 text-center text-muted-foreground">No watches match your filters.</div>
            )}
          </div>
        </section>

        {/* Right: order panel */}
        <aside className="glass-strong rounded-3xl p-5 flex flex-col h-fit xl:sticky xl:top-3 xl:max-h-[calc(100vh-1.5rem)]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Bill #{`DRAFT-${bill.length || 0}`}</h2>
              <p className="text-xs text-muted-foreground">Floyd Miles · Counter 1</p>
            </div>
            <button className="h-9 w-9 rounded-xl glass-soft grid place-items-center hover:shadow-soft">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="glass-soft rounded-2xl p-1 mt-4 flex">
            {(["Dine in", "Take Away", "Delivery"] as OrderType[]).map(t => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={cn(
                  "flex-1 h-9 rounded-xl text-xs font-semibold transition-all",
                  orderType === t ? "gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "Dine in" ? "In Store" : t}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2.5 overflow-y-auto scrollbar-thin pr-1 flex-1 min-h-[120px] max-h-[340px]">
            {bill.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">Cart is empty. Add a watch to start.</div>
            )}
            {bill.map(b => (
              <div key={b.watch.id} className="glass-soft rounded-2xl p-2.5 flex items-center gap-3">
                <img src={b.watch.imageryUrl} alt={b.watch.modelName} loading="lazy" className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{b.watch.modelName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{b.watch.modelName} · {b.watch.color}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-sm font-bold text-primary">${(b.watch.sellingPrice * b.qty).toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(b.watch.id, -1)} className="h-6 w-6 rounded-md bg-primary-soft text-primary grid place-items-center hover:scale-110 transition-transform"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-bold w-4 text-center">{b.qty}</span>
                      <button onClick={() => updateQty(b.watch.id, 1)} className="h-6 w-6 rounded-md gradient-primary text-primary-foreground grid place-items-center hover:scale-110 transition-transform"><Plus className="h-3 w-3" /></button>
                      <button onClick={() => remove(b.watch.id)} className="h-6 w-6 rounded-md text-muted-foreground hover:text-destructive grid place-items-center"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-soft rounded-2xl p-4 mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span><span>${subTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-2">
                Discount
                <input type="number" min={0} max={100} value={discountPct} onChange={e => setDiscountPct(Math.min(100, Math.max(0, +e.target.value || 0)))} className="w-12 h-6 rounded-md bg-background border border-border px-1.5 text-xs outline-none" />%
              </span>
              <span>−${discount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Tax 5%</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-border/60 my-2" />
            <div className="flex items-center justify-between">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-bold text-xl text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Cash", icon: Banknote },
              { label: "Card", icon: CreditCard },
              { label: "QR", icon: QrCode },
            ].map(p => (
              <button key={p.label} onClick={() => handlePay(p.label)} className="glass-soft rounded-2xl py-3 flex flex-col items-center gap-1.5 hover:shadow-glow hover:bg-primary-soft transition-all">
                <p.icon className="h-4 w-4" />
                <span className="text-[11px] font-semibold">{p.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button className="glass-soft rounded-2xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold hover:bg-primary-soft transition-all">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button className="glass-soft rounded-2xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold hover:bg-primary-soft transition-all">
              <Send className="h-3.5 w-3.5" /> Send PDF
            </button>
          </div>

          <button
            onClick={() => handlePay("Multi")}
            className="mt-3 gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow hover:scale-[1.02] transition-transform"
          >
            Place Order · ${total.toFixed(2)}
          </button>
        </aside>
      </div>
    </AppLayout>
  );
};

export default POS;
