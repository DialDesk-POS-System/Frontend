import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { brands, categories } from "@/data/mock";
import { Search, Plus, Filter, Edit3, Eye } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWatches } from "@/hooks/use-watches";

const Inventory = () => {
  const [q, setQ] = useState("");
  const { watches } = useWatches();
  const list = watches.filter(w => (w.modelName + w.brandName + w.modelName).toLowerCase().includes(q.toLowerCase()));
  return (
    <AppLayout>
      <Topbar title="Inventory" subtitle="Live stock across all models & units" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total units", value: 235, accent: "from-emerald-400/30" },
          { label: "Models", value: 48, accent: "from-teal-400/30" },
          { label: "Low stock", value: 6, accent: "from-amber-400/30" },
          { label: "Stock value", value: "$84,210", accent: "from-lime-400/30" },
        ].map(s => (
          <div key={s.label} className="glass rounded-3xl p-5 relative overflow-hidden">
            <div className={`absolute -top-8 -right-8 h-28 w-28 rounded-full bg-gradient-to-br ${s.accent} to-transparent blur-2xl`} />
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-display text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by model, brand, serial…" className="bg-transparent outline-none text-sm flex-1" />
          </div>
          <select className="glass-soft rounded-2xl h-11 px-4 text-sm font-medium outline-none">
            <option>All categories</option>
            {categories.filter(c => c.key !== "All").map(c => <option key={c.key}>{c.label}</option>)}
          </select>
          <select className="glass-soft rounded-2xl h-11 px-4 text-sm font-medium outline-none">
            <option>All brands</option>
            {brands.map(b => <option key={b}>{b}</option>)}
          </select>
          <button className="glass-soft rounded-2xl h-11 w-11 grid place-items-center"><Filter className="h-4 w-4" /></button>
          <button className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold flex items-center gap-2 shadow-glow hover:scale-105 transition-transform">
            <Plus className="h-4 w-4" /> New model
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 font-semibold">Watch</th>
                <th className="py-3 font-semibold">Brand</th>
                <th className="py-3 font-semibold">Category</th>
                <th className="py-3 font-semibold">Cost</th>
                <th className="py-3 font-semibold">Price</th>
                <th className="py-3 font-semibold">Stock</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(w => {
                // const low = w.stock <= 5;
                return (
                  <tr key={w.id} className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={w.imageryUrl} alt={w.modelName} loading="lazy" className="h-11 w-11 rounded-xl object-cover" />
                        <div>
                          <p className="font-semibold">{w.modelName}</p>
                          <p className="text-[11px] text-muted-foreground">{w.modelName} · {w.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{w.brandName}</td>
                    <td className="py-3"><span className="bg-secondary px-2.5 py-1 rounded-full text-xs font-medium">{w.category}</span></td>
                    <td className="py-3 text-muted-foreground">${w.costPrice.toFixed(2)}</td>
                    <td className="py-3 font-bold text-primary">${w.sellingPrice.toFixed(2)}</td>
                    {/* <td className="py-3 font-semibold">{w.stock}</td> */}
                    {/* <td className="py-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        low ? "bg-warning/15 text-warning-foreground" : "bg-primary-soft text-primary"
                      )}>{low ? "Low" : "In stock"}</span>
                    </td> */}
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button className="h-8 w-8 rounded-lg glass-soft grid place-items-center hover:shadow-soft"><Eye className="h-3.5 w-3.5" /></button>
                        <button className="h-8 w-8 rounded-lg glass-soft grid place-items-center hover:shadow-soft"><Edit3 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Inventory;
