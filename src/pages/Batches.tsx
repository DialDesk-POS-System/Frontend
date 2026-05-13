import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { sampleBatches, brands } from "@/data/mock";
import { useWatches } from "@/hooks/use-watches";
import { Plus, Package, Calendar, Truck, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const Batches = () => {
  const [showNew, setShowNew] = useState(false);
  const { watches } = useWatches();
  return (
    <AppLayout>
      <Topbar title="Batch imports" subtitle="Group new stock arrivals into traceable batches" />

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowNew(s => !s)} className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold flex items-center gap-2 shadow-glow hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" /> Start new batch
        </button>
      </div>

      {showNew && (
        <div className="glass rounded-3xl p-6 mb-5 animate-fade-in">
          <h3 className="font-display text-lg font-bold mb-4">New batch import</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Supplier</span>
              <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 mt-1.5">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <input placeholder="Tokyo Time Co." className="bg-transparent outline-none text-sm flex-1" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Import date</span>
              <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 mt-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input type="date" className="bg-transparent outline-none text-sm flex-1" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Invoice / packing ref</span>
              <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 mt-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <input placeholder="PKG-3120" className="bg-transparent outline-none text-sm flex-1" />
              </div>
            </label>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Watch groups</h4>
              <button className="text-xs font-semibold text-primary flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Add group</button>
            </div>
            <div className="glass-soft rounded-2xl p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
              <select className="rounded-xl bg-background border border-border h-10 px-3 text-sm col-span-2">
                <option>Choose model…</option>
                {watches.map(w => <option key={w.id}>{w.modelName}</option>)}
              </select>
              <select className="rounded-xl bg-background border border-border h-10 px-3 text-sm">
                <option>Brand</option>
                {brands.map(b => <option key={b}>{b}</option>)}
              </select>
              <input placeholder="Cost $" className="rounded-xl bg-background border border-border h-10 px-3 text-sm" />
              <input placeholder="Sell $" className="rounded-xl bg-background border border-border h-10 px-3 text-sm" />
              <input placeholder="Qty" className="rounded-xl bg-background border border-border h-10 px-3 text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-5">
            <button onClick={() => setShowNew(false)} className="rounded-2xl h-11 px-5 text-sm font-semibold text-muted-foreground hover:bg-secondary">Cancel</button>
            <button className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold flex items-center gap-2 shadow-glow">
              <CheckCircle2 className="h-4 w-4" /> Confirm batch
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl p-5">
        <h3 className="font-display text-lg font-bold mb-4">Past batches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleBatches.map(b => (
            <div key={b.id} className="glass-soft rounded-2xl p-5 hover:shadow-glow transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-lg">{b.id}</p>
                  <p className="text-xs text-muted-foreground">{b.supplier}</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-primary-soft text-primary grid place-items-center">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Date</p>
                  <p className="font-semibold">{b.date}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Units</p>
                  <p className="font-semibold">{b.units}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Value</p>
                  <p className="font-semibold text-primary">${b.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Batches;
