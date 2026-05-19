import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { Search, Plus, Filter, Edit3, Eye, X, ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useWatches } from "@/hooks/use-watches";
import { useBrands } from "@/hooks/use-brands";
import { useModels } from "@/hooks/use-models";
import { categories } from "@/data/watchConstants";
import { WatchModel } from "@/models/watch";
import { useAnalytics } from "@/hooks/use-analytics";
import { useSearch } from "@/hooks/use-search";

const Inventory = () => {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All brands");
  
  const [selectedModelGroup, setSelectedModelGroup] = useState<WatchModel[] | null>(null);
  const [popupFilters, setPopupFilters] = useState({ serialNo: '', color: '', strapMaterial: '', category: '' });
  const [viewingWatch, setViewingWatch] = useState<WatchModel | null>(null);
  const { 
      watches, 
      loading: watchesLoading, 
      error: watchesError, 
    } = useWatches();
  
    const { 
      models, 
      loading: modelsLoading, 
      error: modelsError, 
    } = useModels();
  
    const {
      brands,
      loading: brandsLoading,
      error: brandsError,
    } = useBrands();

  const { 
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics();

  const {
      groupItems,
      loading: searchLoading,
      error: searchError,
    } = useSearch(query, brand, activeCat);

  const popupFilteredItems = useMemo(() => {
    if (!selectedModelGroup) return [];
    return selectedModelGroup.filter(w => 
      (popupFilters.serialNo === "" || w.serialNo?.toLowerCase().includes(popupFilters.serialNo.toLowerCase())) &&
      (popupFilters.color === "" || w.color === popupFilters.color) &&
      (popupFilters.strapMaterial === "" || w.strapMaterial === popupFilters.strapMaterial) &&
      (popupFilters.category === "" || w.category?.toString() === popupFilters.category)
    );
  }, [selectedModelGroup, popupFilters]);
    
  return (
    <>
      <AppLayout>
        <Topbar title="Inventory" subtitle="Live stock across all models & units" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total units", value: analytics.totalUnits, accent: "from-emerald-400/30" },
          { label: "Models", value: analytics.totalModels, accent: "from-teal-400/30" },
          { label: "Low stock", value: analytics.lowStockModels.length, accent: "from-amber-400/30" },
          { label: "Stock value", value: `$ ${analytics.totalStockValue}`, accent: "from-lime-400/30" },
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
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by model, brand, serial…" className="bg-transparent outline-none text-sm flex-1" />
          </div>
          <select value={activeCat} onChange={e => setActiveCat(e.target.value)} className="glass-soft rounded-2xl h-11 px-4 text-sm font-medium outline-none">
            <option value="All">All categories</option>
            {categories.filter(c => c.key !== "All").map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <select value={brand} onChange={e => setBrand(e.target.value)} className="glass-soft rounded-2xl h-11 px-4 text-sm font-medium outline-none">
            <option value="All brands">All brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
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
                <th className="py-3 font-semibold">Stock</th>
                <th className="py-3 font-semibold">Cost</th>
                <th className="py-3 font-semibold">Price</th>
                <th className="py-3 font-semibold">Serial No</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupItems.map(group => {
                if (group.type === "watch") {
                  const w = group.item;
                  return (
                    <tr key={w.id} className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img src={w.imageryUrl} alt={w.modelName} loading="lazy" className="h-11 w-11 rounded-xl object-cover" />
                          <div>
                            <p className="font-semibold">{w.modelName}</p>
                            <p className="text-[11px] text-muted-foreground">{w.modelNo} · {w.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{w.brandName}</td>
                      <td className="py-3"><span className="bg-secondary px-2.5 py-1 rounded-full text-xs font-medium">{w.category}</span></td>
                      <td className="py-3 font-semibold text-xs">-</td>
                      <td className="py-3 text-muted-foreground">${w.costPrice.toFixed(2)}</td>
                      <td className="py-3 font-bold text-primary">${w.sellingPrice.toFixed(2)}</td>
                      <td className="py-3 font-semibold text-xs">{w.serialNo || "-"}</td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold",
                          w.isSold ? "bg-muted text-muted-foreground" : "bg-primary-soft text-primary"
                        )}>{w.isSold ? "Sold" : "Available"}</span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-1.5 justify-end w-full">
                          <button onClick={() => setViewingWatch(w)} className="h-8 w-8 rounded-lg glass-soft grid place-items-center hover:shadow-soft"><Eye className="h-3.5 w-3.5" /></button>
                          <button className="h-8 w-8 rounded-lg glass-soft grid place-items-center hover:shadow-soft"><Edit3 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                } else {
                  const first = group.firstItem;
                  const actualModel = models.find(mod => mod.id === first.modelId);
                  const imageUrl = actualModel?.imageryUrl || first.imageryUrl;

                  return (
                    <tr key={`model-${first.modelId}`} className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img src={imageUrl} alt={first.modelName} loading="lazy" className="h-11 w-11 rounded-xl object-cover" />
                          <div>
                            <p className="font-semibold">{first.modelName}</p>
                            <p className="text-[11px] text-muted-foreground">{first.modelNo} · Multiple variants</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{first.brandName}</td>
                      <td className="py-3"><span className="bg-secondary px-2.5 py-1 rounded-full text-xs font-medium">{first.category}</span></td>
                      <td className="py-3 font-semibold text-primary">{group.items.length} units</td>
                      <td className="py-3 text-right" colSpan={5}>
                        <div className="flex justify-end w-full">
                          <button 
                            onClick={() => {
                              setSelectedModelGroup(group.items);
                              setPopupFilters({ serialNo: '', color: '', strapMaterial: '', category: '' });
                              setViewingWatch(null);
                            }}
                            className="h-9 px-4 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center shadow-glow hover:scale-[1.02] transition-transform"
                          >
                            Select a watch
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
      </AppLayout>

      {/* Select Watch Modal (Inventory View) */}
      {(selectedModelGroup || viewingWatch) && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onMouseDown={() => { setSelectedModelGroup(null); setViewingWatch(null); }}
        >
          <div 
            className="glass-strong rounded-3xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-in shadow-2xl"
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display">{viewingWatch ? "Watch Details" : "Inventory Variants"}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedModelGroup ? `${selectedModelGroup[0]?.brandName} · ${selectedModelGroup[0]?.modelName}` : `${viewingWatch?.brandName} · ${viewingWatch?.modelName}`}
                </p>
              </div>
              <div className="flex gap-2">
                {(viewingWatch && selectedModelGroup) && (
                  <button onClick={() => setViewingWatch(null)} className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-secondary transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <button onClick={() => { setSelectedModelGroup(null); setViewingWatch(null); }} className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {viewingWatch ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 bg-gradient-to-b from-background to-secondary/10">
                <div className="shrink-0">
                  <img src={viewingWatch.imageryUrl} alt={viewingWatch.modelName} className="w-56 h-56 rounded-3xl object-cover shadow-strong border border-border/50" />
                </div>
                <div className="flex-1 flex flex-col gap-5">
                  <div>
                    <h3 className="text-2xl font-bold font-display">{viewingWatch.modelName}</h3>
                    <p className="text-muted-foreground">{viewingWatch.modelNo} · {viewingWatch.category}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="glass-soft p-4 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1">Serial Number</p>
                      <p className="font-semibold text-sm">{viewingWatch.serialNo || "N/A"}</p>
                    </div>
                    <div className="glass-soft p-4 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <p className="font-semibold text-sm">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider", viewingWatch.isSold ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary")}>
                          {viewingWatch.isSold ? "Sold" : "Available"}
                        </span>
                      </p>
                    </div>
                    <div className="glass-soft p-4 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1">Color</p>
                      <p className="font-semibold text-sm">{viewingWatch.color || "N/A"}</p>
                    </div>
                    <div className="glass-soft p-4 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1">Strap</p>
                      <p className="font-semibold text-sm">{viewingWatch.strapMaterial || "N/A"}</p>
                    </div>
                    <div className="glass-soft p-4 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1">Cost Price</p>
                      <p className="font-semibold text-sm">${viewingWatch.costPrice?.toFixed(2)}</p>
                    </div>
                    <div className="glass-soft p-4 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1">Selling Price</p>
                      <p className="font-bold text-primary text-sm">${viewingWatch.sellingPrice?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="p-5 bg-secondary/30 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input 
                    placeholder="Search Serial No..." 
                    value={popupFilters.serialNo}
                    onChange={e => setPopupFilters(p => ({ ...p, serialNo: e.target.value }))}
                    className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                  />
                  <select 
                    value={popupFilters.category}
                    onChange={e => setPopupFilters(p => ({ ...p, category: e.target.value }))}
                    className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                  >
                    <option value="">All Categories</option>
                    {Array.from(new Set(selectedModelGroup.map(w => w.category?.toString()).filter(Boolean))).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select 
                    value={popupFilters.color}
                    onChange={e => setPopupFilters(p => ({ ...p, color: e.target.value }))}
                    className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                  >
                    <option value="">All Colors</option>
                    {Array.from(new Set(selectedModelGroup.map(w => w.color).filter(Boolean))).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select 
                    value={popupFilters.strapMaterial}
                    onChange={e => setPopupFilters(p => ({ ...p, strapMaterial: e.target.value }))}
                    className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border"
                  >
                    <option value="">All Straps</option>
                    {Array.from(new Set(selectedModelGroup.map(w => w.strapMaterial).filter(Boolean))).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {popupFilteredItems.map(w => (
                    <div 
                      key={w.id} 
                      onClick={() => setViewingWatch(w)}
                      className="glass rounded-2xl p-3 flex items-center justify-between group hover:shadow-soft transition-all cursor-pointer hover:-translate-y-0.5"
                    >
                      <div>
                        <p className="font-semibold text-sm">SN: {w.serialNo || "N/A"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{w.color || "No Color"} · {w.strapMaterial || "No Strap"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">${w.sellingPrice?.toFixed(2)}</span>
                        <button className="h-8 px-3 rounded-xl glass-soft text-xs font-semibold group-hover:bg-primary-soft transition-all flex items-center gap-1">
                          <Eye className="h-3 w-3" /> View
                        </button>
                      </div>
                    </div>
                  ))}
                  {popupFilteredItems.length === 0 && (
                    <div className="col-span-full py-10 text-center text-muted-foreground text-sm">No variants match these filters.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Inventory;