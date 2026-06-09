import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { Search, Plus, Filter, SlidersHorizontal, Edit3, Eye, X, ChevronLeft, Trash2, Loader2, Check, Package } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWatches } from "@/hooks/use-watches";
import { useBrands } from "@/hooks/use-brands";
import { useModels } from "@/hooks/use-models";
import { categories } from "@/data/watchConstants";
import { WatchModel } from "@/models/watch";
import { useAnalytics } from "@/hooks/use-analytics";
import { useSearch, ExtraFilters } from "@/hooks/use-search";
import { api } from "@/services/api";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
type InventoryTab = "watches" | "models" | "brands";
type CrudMode = "add" | "update" | "delete";

// ── Main Component ─────────────────────────────────────────────────────────
const Inventory = () => {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All brands");

  const [selectedModelGroup, setSelectedModelGroup] = useState<WatchModel[] | null>(null);
  const [popupFilters, setPopupFilters] = useState({ serialNo: '', color: '', strapMaterial: '', category: '' });
  const [viewingWatch, setViewingWatch] = useState<WatchModel | null>(null);
  const [watchToEdit, setWatchToEdit] = useState<any>(null);

  const [showManageModal, setShowManageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<InventoryTab>("watches");
  const [crudMode, setCrudMode] = useState<CrudMode>("add");

  const { watches, loading: watchesLoading } = useWatches();
  const { models, loading: modelsLoading } = useModels();
  const { brands, loading: brandsLoading } = useBrands();
  const { analytics } = useAnalytics();
  const [showFilters, setShowFilters] = useState(false);
  const [extraFilters, setExtraFilters] = useState<ExtraFilters>({});

  const { groupItems, loading: searchLoading, error: searchError } = useSearch(query, brand, activeCat, extraFilters);

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
            <button 
              onClick={() => setShowFilters(p => !p)}
              className={cn("glass rounded-2xl h-11 w-11 grid place-items-center hover:shadow-glow transition-all", showFilters && "gradient-primary text-primary-foreground shadow-glow")}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setShowManageModal(true); setActiveTab("watches"); setCrudMode("add"); }}
              className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold flex items-center gap-2 shadow-glow hover:scale-105 transition-transform"
            >
              <Package className="h-4 w-4" /> Manage Inventory
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
                {searchLoading || modelsLoading || brandsLoading ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
                      Loading inventory...
                    </td>
                  </tr>
                ) : groupItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-muted-foreground">
                      No watches found.
                    </td>
                  </tr>
                ) : (
                  groupItems.map(group => {
                  if (group.type === "watch") {
                    const w = group.item;
                    return (
                      <tr key={w.id} className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img src={w.imageryUrl || "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"} onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"; }} alt={w.modelName} loading="lazy" className="h-11 w-11 rounded-xl object-cover" />
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
                            <button onClick={() => {
                              setWatchToEdit(w);
                              setActiveTab("watches");
                              setCrudMode("update");
                              setShowManageModal(true);
                            }} className="h-8 w-8 rounded-lg glass-soft grid place-items-center hover:shadow-soft"><Edit3 className="h-3.5 w-3.5" /></button>
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
                            <img src={imageUrl || "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"} onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"; }} alt={first.modelName} loading="lazy" className="h-11 w-11 rounded-xl object-cover" />
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
                }))}
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>

      {/* ── View/Select Watch Modal ────────────────────────────────── */}
      {(selectedModelGroup || viewingWatch) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onMouseDown={() => { setSelectedModelGroup(null); setViewingWatch(null); }}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-in shadow-2xl"
            onMouseDown={e => e.stopPropagation()}
          >
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
                  <img src={viewingWatch.imageryUrl || "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"} onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524592094714-cb9c5a4d5d14?auto=format&fit=crop&q=80&w=200"; }} alt={viewingWatch.modelName} className="w-56 h-56 rounded-3xl object-cover shadow-strong border border-border/50" />
                </div>
                <div className="flex-1 flex flex-col gap-5">
                  <div>
                    <h3 className="text-2xl font-bold font-display">{viewingWatch.modelName}</h3>
                    <p className="text-muted-foreground">{viewingWatch.modelNo} · {viewingWatch.category}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Serial Number", value: viewingWatch.serialNo || "N/A" },
                      { label: "Status", value: viewingWatch.isSold ? "Sold" : "Available", isStatus: true },
                      { label: "Color", value: viewingWatch.color || "N/A" },
                      { label: "Strap", value: viewingWatch.strapMaterial || "N/A" },
                      { label: "Cost Price", value: `$${viewingWatch.costPrice?.toFixed(2)}` },
                      { label: "Selling Price", value: `$${viewingWatch.sellingPrice?.toFixed(2)}`, isPrimary: true },
                    ].map(d => (
                      <div key={d.label} className="glass-soft p-4 rounded-2xl">
                        <p className="text-xs text-muted-foreground mb-1">{d.label}</p>
                        {d.isStatus ? (
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold", viewingWatch.isSold ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary")}>{d.value}</span>
                        ) : (
                          <p className={cn("font-semibold text-sm", d.isPrimary && "text-primary font-bold")}>{d.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 bg-secondary/30 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input placeholder="Search Serial No..." value={popupFilters.serialNo} onChange={e => setPopupFilters(p => ({ ...p, serialNo: e.target.value }))} className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border" />
                  <select value={popupFilters.category} onChange={e => setPopupFilters(p => ({ ...p, category: e.target.value }))} className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border">
                    <option value="">All Categories</option>
                    {selectedModelGroup && Array.from(new Set(selectedModelGroup.map(w => w.category?.toString()).filter(Boolean))).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={popupFilters.color} onChange={e => setPopupFilters(p => ({ ...p, color: e.target.value }))} className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border">
                    <option value="">All Colors</option>
                    {selectedModelGroup && Array.from(new Set(selectedModelGroup.map(w => w.color).filter(Boolean))).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={popupFilters.strapMaterial} onChange={e => setPopupFilters(p => ({ ...p, strapMaterial: e.target.value }))} className="h-10 rounded-xl px-3 text-sm outline-none bg-background border border-border">
                    <option value="">All Straps</option>
                    {selectedModelGroup && Array.from(new Set(selectedModelGroup.map(w => w.strapMaterial).filter(Boolean))).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {popupFilteredItems.map(w => (
                    <div key={w.id} onClick={() => setViewingWatch(w)} className="glass rounded-2xl p-3 flex items-center justify-between group hover:shadow-soft transition-all cursor-pointer hover:-translate-y-0.5">
                      <div>
                        <p className="font-semibold text-sm">SN: {w.serialNo || "N/A"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{w.color || "No Color"} · {w.strapMaterial || "No Strap"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">${w.sellingPrice?.toFixed(2)}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setViewingWatch(w)} className="h-8 px-3 rounded-xl glass-soft text-xs font-semibold group-hover:bg-primary-soft transition-all flex items-center gap-1">
                            <Eye className="h-3 w-3" /> View
                          </button>
                          <button onClick={() => {
                            setWatchToEdit(w);
                            setActiveTab("watches");
                            setCrudMode("update");
                            setSelectedModelGroup(null);
                            setViewingWatch(null);
                            setShowManageModal(true);
                          }} className="h-8 w-8 rounded-xl glass-soft text-xs font-semibold group-hover:bg-primary-soft transition-all grid place-items-center">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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

      {/* ── Manage Inventory Modal ──────────────────────────────────── */}
      {showManageModal && (
        <ManageInventoryModal
          onClose={() => { setShowManageModal(false); setWatchToEdit(null); }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          crudMode={crudMode}
          setCrudMode={setCrudMode}
          watchToEdit={watchToEdit}
        />
      )}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Manage Inventory Modal
// ══════════════════════════════════════════════════════════════════════════

interface ManageInventoryModalProps {
  onClose: () => void;
  activeTab: InventoryTab;
  setActiveTab: (t: InventoryTab) => void;
  crudMode: CrudMode;
  setCrudMode: (m: CrudMode) => void;
  watchToEdit?: any;
}

const ManageInventoryModal = ({ onClose, activeTab, setActiveTab, crudMode, setCrudMode, watchToEdit }: ManageInventoryModalProps) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="glass-strong rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display">Manage Inventory</h2>
            <p className="text-sm text-muted-foreground">Add, update, or delete watches, models, and brands</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border/50">
          {(["watches", "models", "brands"] as InventoryTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCrudMode("add"); }}
              className={cn(
                "flex-1 py-3 text-sm font-semibold transition-all relative",
                activeTab === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 gradient-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "watches" && <WatchCrud mode={crudMode} initialWatchToEdit={watchToEdit} />}
          {activeTab === "models" && <ModelCrud mode={crudMode} />}
          {activeTab === "brands" && <BrandCrud mode={crudMode} />}
        </div>

        {/* Mode buttons */}
        <div className="p-4 border-t border-border/50 flex gap-2">
          {(["add", "update", "delete"] as CrudMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setCrudMode(m)}
              className={cn(
                "flex-1 h-10 rounded-xl text-sm font-semibold transition-all",
                crudMode === m
                  ? m === "delete"
                    ? "bg-destructive/10 text-destructive border-2 border-destructive/30"
                    : "gradient-primary text-primary-foreground shadow-glow"
                  : "glass-soft hover:shadow-soft"
              )}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Confirmation Dialog
// ══════════════════════════════════════════════════════════════════════════
const ConfirmDialog = ({ title, message, onConfirm, onCancel, loading }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onMouseDown={onCancel}>
    <div className="glass-strong rounded-3xl w-full max-w-sm p-6 animate-scale-in shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-bold font-display">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{message}</p>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} disabled={loading} className="flex-1 glass-soft rounded-xl h-10 text-sm font-semibold">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 gradient-primary text-primary-foreground rounded-xl h-10 text-sm font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Confirm"}
        </button>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// Watch CRUD
// ══════════════════════════════════════════════════════════════════════════
const inputCls = "w-full h-11 rounded-xl px-4 text-sm outline-none bg-background border border-border focus:border-primary transition-colors";
const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

const WatchCrud = ({ mode, initialWatchToEdit }: { mode: CrudMode, initialWatchToEdit?: any }) => {
  const [form, setForm] = useState<any>({ modelId: "", importId: "", quantity: 1, serialNo: "", color: "", strapMaterial: "", waterResistanceM: "", costPrice: "", sellingPrice: "", imageryUrl: "" });
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // For import selection
  const [importMode, setImportMode] = useState<"existing" | "new">("existing");
  const [importSearchFrom, setImportSearchFrom] = useState("");
  const [importSearchTo, setImportSearchTo] = useState("");
  const [importResults, setImportResults] = useState<any[]>([]);
  const [selectedImport, setSelectedImport] = useState<any>(null);
  const [importSearching, setImportSearching] = useState(false);
  const [newImportSupplier, setNewImportSupplier] = useState("");
  const [newImportDate, setNewImportDate] = useState(new Date().toISOString().slice(0, 10));

  // For update/delete: search
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWatch, setSelectedWatch] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (initialWatchToEdit && mode === "update") {
      setSelectedWatch(initialWatchToEdit);
      setForm({
        modelId: initialWatchToEdit.modelId || "",
        serialNo: initialWatchToEdit.serialNo || "",
        color: initialWatchToEdit.color || "",
        strapMaterial: initialWatchToEdit.strapMaterial || "",
        waterResistanceM: initialWatchToEdit.waterResistanceM || "",
        costPrice: initialWatchToEdit.costPrice || "",
        sellingPrice: initialWatchToEdit.sellingPrice || "",
        imageryUrl: initialWatchToEdit.imageryUrl || "",
      });
    }
  }, [initialWatchToEdit, mode]);

  // Fetch models & brands for dropdowns
  const [models, setModels] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Autocomplete state for model
  const [modelSearch, setModelSearch] = useState("");
  const [modelDropdown, setModelDropdown] = useState(false);

  useEffect(() => {
    api.models.getAll().then(setModels).catch(() => {});
    api.brands.getAll().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode !== "add") {
        if (searchQ.trim()) searchWatches();
        else setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ, mode]);

  const searchImports = async () => {
    if (!importSearchFrom || !importSearchTo) return;
    setImportSearching(true);
    try {
      const res = await api.imports.getByDateRange(importSearchFrom, importSearchTo);
      setImportResults(res);
    } catch { toast.error("Failed to search imports"); }
    finally { setImportSearching(false); }
  };

  const searchWatches = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    try {
      const res = await api.watches.search(searchQ, "All brands", "All", 1, 20);
      const items = res.items || res;
      const flat: any[] = [];
      for (const g of items) {
        if (g.type === "watch" && g.item) flat.push(g.item);
        else if (g.items) flat.push(...g.items);
      }
      setSearchResults(flat);
    } catch { toast.error("Search failed"); }
    finally { setSearching(false); }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      let importId = form.importId;

      if (importMode === "new") {
        const newImport = await api.imports.create({
          supplier: newImportSupplier || null,
          importDate: new Date(newImportDate).toISOString(),
          totalItems: +form.quantity || 1,
          watches: [],
        });
        importId = newImport.id;
      } else if (selectedImport) {
        importId = selectedImport.id;
      }

      if (!importId) { toast.error("Please select or create an import"); setLoading(false); return; }

      await api.watches.create({
        modelId: +form.modelId,
        importId: +importId,
        quantity: +form.quantity || 1,
        serialNo: form.serialNo || null,
        color: form.color || null,
        strapMaterial: form.strapMaterial || null,
        waterResistanceM: form.waterResistanceM ? +form.waterResistanceM : null,
        costPrice: +form.costPrice,
        sellingPrice: +form.sellingPrice,
        imageryUrl: form.imageryUrl || null,
      });
      toast.success("Watch added successfully!");
      setForm({ modelId: "", importId: "", quantity: 1, serialNo: "", color: "", strapMaterial: "", waterResistanceM: "", costPrice: "", sellingPrice: "", imageryUrl: "" });
      setSelectedImport(null);
    } catch (e: any) { toast.error(e.message || "Failed to add watch"); }
    finally { setLoading(false); setConfirm(false); }
  };

  const handleUpdate = async () => {
    if (!selectedWatch) return;
    setLoading(true);
    try {
      await api.watches.update(selectedWatch.id, {
        modelId: form.modelId ? +form.modelId : undefined,
        serialNo: form.serialNo || undefined,
        color: form.color || undefined,
        strapMaterial: form.strapMaterial || undefined,
        waterResistanceM: form.waterResistanceM ? +form.waterResistanceM : undefined,
        costPrice: form.costPrice ? +form.costPrice : undefined,
        sellingPrice: form.sellingPrice ? +form.sellingPrice : undefined,
        imageryUrl: form.imageryUrl || undefined,
      });
      toast.success("Watch updated!");
      setSelectedWatch(null);
      setSearchResults([]);
    } catch (e: any) { toast.error(e.message || "Failed to update"); }
    finally { setLoading(false); setConfirm(false); }
  };

  const handleDelete = async () => {
    if (!selectedWatch) return;
    setLoading(true);
    try {
      await api.watches.delete(selectedWatch.id);
      toast.success("Watch deleted!");
      setSelectedWatch(null);
      setSearchResults([]);
    } catch (e: any) { toast.error(e.message || "Failed to delete"); }
    finally { setLoading(false); setConfirm(false); }
  };

  if (mode === "add") {
    return (
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className={labelCls}>Model *</label>
            <input
              value={modelSearch}
              onChange={e => {
                setModelSearch(e.target.value);
                setForm((f: any) => ({ ...f, modelId: "" }));
                setModelDropdown(true);
              }}
              onFocus={() => setModelDropdown(true)}
              onBlur={() => setTimeout(() => setModelDropdown(false), 200)}
              placeholder="Search model by name or no..."
              className={inputCls + " mt-1"}
            />
            {modelDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto scrollbar-thin">
                {models.filter((m: any) => 
                  (m.modelName + " " + m.modelNo).toLowerCase().includes(modelSearch.toLowerCase())
                ).map((m: any) => (
                  <div
                    key={m.id}
                    className="p-2.5 text-sm hover:bg-primary/10 cursor-pointer border-b border-border/50 last:border-0"
                    onClick={() => {
                      setForm((f: any) => ({ ...f, modelId: m.id }));
                      setModelSearch(`${m.modelName} (${m.modelNo})`);
                      setModelDropdown(false);
                    }}
                  >
                    <span className="font-semibold">{m.modelName}</span> <span className="text-muted-foreground text-xs">({m.modelNo})</span>
                  </div>
                ))}
                {models.filter((m: any) => 
                  (m.modelName + " " + m.modelNo).toLowerCase().includes(modelSearch.toLowerCase())
                ).length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground text-center">No matching models</div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>Quantity</label>
            <input type="number" min={1} value={form.quantity} onChange={e => setForm((f: any) => ({ ...f, quantity: e.target.value }))} className={inputCls + " mt-1"} />
          </div>
        </div>

        {/* Import selection */}
        <div className="glass-soft rounded-2xl p-4 space-y-3">
          <label className={labelCls}>Import Source *</label>
          <div className="flex gap-2">
            <button onClick={() => { setImportMode("existing"); setNewImportSupplier(""); }} className={cn("flex-1 h-9 rounded-xl text-xs font-semibold transition-all", importMode === "existing" ? "gradient-primary text-primary-foreground" : "glass hover:shadow-soft")}>
              Existing Import
            </button>
            <button onClick={() => { setImportMode("new"); setSelectedImport(null); setImportResults([]); }} className={cn("flex-1 h-9 rounded-xl text-xs font-semibold transition-all", importMode === "new" ? "gradient-primary text-primary-foreground" : "glass hover:shadow-soft")}>
              New Import
            </button>
          </div>

          {importMode === "existing" ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input type="date" value={importSearchFrom} onChange={e => setImportSearchFrom(e.target.value)} className={inputCls + " flex-1"} />
                <input type="date" value={importSearchTo} onChange={e => setImportSearchTo(e.target.value)} className={inputCls + " flex-1"} />
                <button onClick={searchImports} disabled={importSearching} className="h-11 px-4 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold shadow-glow flex items-center gap-1">
                  {importSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />} Search
                </button>
              </div>
              {importResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                  {importResults.map((imp: any) => (
                    <button
                      key={imp.id}
                      onClick={() => { setSelectedImport(imp); setForm((f: any) => ({ ...f, importId: imp.id })); }}
                      className={cn("w-full text-left p-2 rounded-xl text-sm transition-all", selectedImport?.id === imp.id ? "bg-primary/10 border border-primary/30" : "glass-soft hover:shadow-soft")}
                    >
                      <span className="font-semibold">#{imp.id}</span> · {new Date(imp.importDate).toLocaleDateString()} · {imp.supplier || "No supplier"} · {imp.totalItems} items
                    </button>
                  ))}
                </div>
              )}
              {selectedImport && <p className="text-xs text-primary font-semibold">Selected: Import #{selectedImport.id}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Supplier</label>
                <input value={newImportSupplier} onChange={e => setNewImportSupplier(e.target.value)} placeholder="Supplier name" className={inputCls + " mt-1"} />
              </div>
              <div>
                <label className={labelCls}>Import Date</label>
                <input type="date" value={newImportDate} onChange={e => setNewImportDate(e.target.value)} className={inputCls + " mt-1"} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Serial No</label><input value={form.serialNo} onChange={e => setForm((f: any) => ({ ...f, serialNo: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Color</label><input value={form.color} onChange={e => setForm((f: any) => ({ ...f, color: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Strap Material</label><input value={form.strapMaterial} onChange={e => setForm((f: any) => ({ ...f, strapMaterial: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Water Resistance (m)</label><input type="number" value={form.waterResistanceM} onChange={e => setForm((f: any) => ({ ...f, waterResistanceM: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Cost Price *</label><input type="number" value={form.costPrice} onChange={e => setForm((f: any) => ({ ...f, costPrice: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Selling Price *</label><input type="number" value={form.sellingPrice} onChange={e => setForm((f: any) => ({ ...f, sellingPrice: e.target.value }))} className={inputCls + " mt-1"} /></div>
        </div>
        <div><label className={labelCls}>Image URL</label><input value={form.imageryUrl} onChange={e => setForm((f: any) => ({ ...f, imageryUrl: e.target.value }))} className={inputCls + " mt-1"} /></div>

        <button onClick={() => setConfirm(true)} disabled={!form.modelId || !form.costPrice || !form.sellingPrice} className="w-full gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-40">
          Add Watch
        </button>

        {confirm && <ConfirmDialog title="Add Watch" message="Are you sure you want to add this watch to inventory?" onConfirm={handleAdd} onCancel={() => setConfirm(false)} loading={loading} />}
      </div>
    );
  }

  // Update / Delete
  return (
    <div className="p-5 space-y-4">
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && searchWatches()} placeholder="Search watch by model, serial, brand..." className={inputCls + " w-full pr-10"} />
          {searching && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
        <button onClick={searchWatches} disabled={searching} className="h-11 px-5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-2">
          <Search className="h-4 w-4" /> Search
        </button>
      </div>

      {searchResults.length > 0 && !selectedWatch && (
        <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
          {searchResults.map((w: any) => (
            <button key={w.id} onClick={() => {
              setSelectedWatch(w);
              if (mode === "update") setForm({ modelId: w.modelId || "", serialNo: w.serialNo || "", color: w.color || "", strapMaterial: w.strapMaterial || "", waterResistanceM: w.waterResistanceM || "", costPrice: w.costPrice || "", sellingPrice: w.sellingPrice || "", imageryUrl: w.imageryUrl || "" });
            }} className="w-full text-left glass rounded-2xl p-3 flex items-center justify-between hover:shadow-soft transition-all">
              <div>
                <p className="font-semibold text-sm">{w.modelName} · {w.modelNo}</p>
                <p className="text-xs text-muted-foreground">SN: {w.serialNo || "N/A"} · {w.color || "No color"} · {w.brandName}</p>
              </div>
              <span className="font-bold text-primary text-sm">${w.sellingPrice?.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}

      {selectedWatch && mode === "update" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Editing: {selectedWatch.modelName} (SN: {selectedWatch.serialNo || "N/A"})</p>
            <button onClick={() => setSelectedWatch(null)} className="text-xs text-primary font-semibold hover:underline">Change</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Model</label><select value={form.modelId} onChange={e => setForm((f: any) => ({ ...f, modelId: e.target.value }))} className={inputCls + " mt-1"}><option value="">Keep current</option>{models.map((m: any) => <option key={m.id} value={m.id}>{m.modelName}</option>)}</select></div>
            <div><label className={labelCls}>Serial No</label><input value={form.serialNo} onChange={e => setForm((f: any) => ({ ...f, serialNo: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Color</label><input value={form.color} onChange={e => setForm((f: any) => ({ ...f, color: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Strap Material</label><input value={form.strapMaterial} onChange={e => setForm((f: any) => ({ ...f, strapMaterial: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Water Resistance (m)</label><input type="number" value={form.waterResistanceM} onChange={e => setForm((f: any) => ({ ...f, waterResistanceM: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Cost Price</label><input type="number" value={form.costPrice} onChange={e => setForm((f: any) => ({ ...f, costPrice: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Selling Price</label><input type="number" value={form.sellingPrice} onChange={e => setForm((f: any) => ({ ...f, sellingPrice: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Image URL</label><input value={form.imageryUrl} onChange={e => setForm((f: any) => ({ ...f, imageryUrl: e.target.value }))} className={inputCls + " mt-1"} /></div>
          </div>
          <button onClick={() => setConfirm(true)} className="w-full gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow hover:scale-[1.02] transition-transform">
            Update Watch
          </button>
          {confirm && <ConfirmDialog title="Update Watch" message="Apply changes to this watch?" onConfirm={handleUpdate} onCancel={() => setConfirm(false)} loading={loading} />}
        </>
      )}

      {selectedWatch && mode === "delete" && (
        <>
          <div className="glass-soft rounded-2xl p-4 space-y-2">
            <p className="font-bold text-lg">{selectedWatch.modelName}</p>
            <p className="text-sm text-muted-foreground">{selectedWatch.modelNo} · {selectedWatch.brandName}</p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              <div><span className="text-muted-foreground">SN:</span> {selectedWatch.serialNo || "N/A"}</div>
              <div><span className="text-muted-foreground">Color:</span> {selectedWatch.color || "N/A"}</div>
              <div><span className="text-muted-foreground">Price:</span> <span className="text-primary font-bold">${selectedWatch.sellingPrice?.toFixed(2)}</span></div>
            </div>
          </div>
          <button onClick={() => setConfirm(true)} className="w-full bg-destructive/10 text-destructive border-2 border-destructive/30 rounded-2xl h-12 font-semibold hover:bg-destructive/20 transition-all flex items-center justify-center gap-2">
            <Trash2 className="h-4 w-4" /> Delete Watch
          </button>
          {confirm && <ConfirmDialog title="Delete Watch" message="This action cannot be undone. Delete this watch?" onConfirm={handleDelete} onCancel={() => setConfirm(false)} loading={loading} />}
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Model CRUD
// ══════════════════════════════════════════════════════════════════════════
const ModelCrud = ({ mode }: { mode: CrudMode }) => {
  const [form, setForm] = useState<any>({ modelNo: "", category: "hand_watches", brandId: "", modelName: "", lowStockThreshold: "", basePrice: "", description: "", imageryUrl: "", isActive: true });
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.brands.getAll().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode !== "add") {
        if (searchQ.trim()) searchModels();
        else setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ, mode]);

  const searchModels = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    try {
      const res = await api.models.search(searchQ);
      setSearchResults(res);
    } catch { toast.error("Search failed"); }
    finally { setSearching(false); }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.models.create({
        modelNo: form.modelNo, category: form.category, brandId: +form.brandId,
        modelName: form.modelName, lowStockThreshold: form.lowStockThreshold ? +form.lowStockThreshold : null,
        basePrice: +form.basePrice, description: form.description || null,
        imageryUrl: form.imageryUrl || null, isActive: form.isActive,
      });
      toast.success("Model added!");
      setForm({ modelNo: "", category: "hand_watches", brandId: "", modelName: "", lowStockThreshold: "", basePrice: "", description: "", imageryUrl: "", isActive: true });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); setConfirm(false); }
  };

  const handleUpdate = async () => {
    if (!selectedModel) return;
    setLoading(true);
    try {
      await api.models.update(selectedModel.id, {
        modelNo: form.modelNo || undefined, category: form.category || undefined,
        brandId: form.brandId ? +form.brandId : undefined, modelName: form.modelName || undefined,
        lowStockThreshold: form.lowStockThreshold ? +form.lowStockThreshold : undefined,
        description: form.description || undefined, imageryUrl: form.imageryUrl || undefined,
        isActive: form.isActive,
      });
      toast.success("Model updated!");
      setSelectedModel(null); setSearchResults([]);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); setConfirm(false); }
  };

  const handleDelete = async () => {
    if (!selectedModel) return;
    setLoading(true);
    try {
      await api.models.delete(selectedModel.id);
      toast.success("Model deleted!");
      setSelectedModel(null); setSearchResults([]);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); setConfirm(false); }
  };

  if (mode === "add") {
    return (
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Model Name *</label><input value={form.modelName} onChange={e => setForm((f: any) => ({ ...f, modelName: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Model No *</label><input value={form.modelNo} onChange={e => setForm((f: any) => ({ ...f, modelNo: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Category *</label>
            <select value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))} className={inputCls + " mt-1"}>
              <option value="hand_watches">Hand Watches</option>
              <option value="wall_clocks">Wall Clocks</option>
            </select>
          </div>
          <div><label className={labelCls}>Brand *</label>
            <select value={form.brandId} onChange={e => setForm((f: any) => ({ ...f, brandId: e.target.value }))} className={inputCls + " mt-1"}>
              <option value="">Select brand</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Base Price *</label><input type="number" value={form.basePrice} onChange={e => setForm((f: any) => ({ ...f, basePrice: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Low Stock Threshold</label><input type="number" value={form.lowStockThreshold} onChange={e => setForm((f: any) => ({ ...f, lowStockThreshold: e.target.value }))} className={inputCls + " mt-1"} /></div>
        </div>
        <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} className={inputCls + " mt-1 !h-auto py-3 resize-none"} /></div>
        <div><label className={labelCls}>Image URL</label><input value={form.imageryUrl} onChange={e => setForm((f: any) => ({ ...f, imageryUrl: e.target.value }))} className={inputCls + " mt-1"} /></div>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <div className={cn("h-5 w-5 rounded-md border-2 grid place-items-center transition-all", form.isActive ? "bg-primary border-primary text-primary-foreground" : "border-border")}>
            {form.isActive && <Check className="h-3 w-3" />}
          </div>
          Active
        </label>
        <button onClick={() => setConfirm(true)} disabled={!form.modelName || !form.modelNo || !form.brandId || !form.basePrice} className="w-full gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-40">Add Model</button>
        {confirm && <ConfirmDialog title="Add Model" message="Add this model to the catalog?" onConfirm={handleAdd} onCancel={() => setConfirm(false)} loading={loading} />}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && searchModels()} placeholder="Search model by model no..." className={inputCls + " w-full pr-10"} />
          {searching && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
        <button onClick={searchModels} disabled={searching} className="h-11 px-5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-2">
          <Search className="h-4 w-4" /> Search
        </button>
      </div>
      {searchResults.length > 0 && !selectedModel && (
        <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
          {searchResults.map((m: any) => (
            <button key={m.id} onClick={() => {
              setSelectedModel(m);
              if (mode === "update") setForm({ modelNo: m.modelNo || "", category: m.category || "hand_watches", brandId: m.brandId || "", modelName: m.modelName || "", lowStockThreshold: m.lowStockThreshold || "", basePrice: m.basePrice || "", description: m.description || "", imageryUrl: m.imageryUrl || "", isActive: m.isActive ?? true });
            }} className="w-full text-left glass rounded-2xl p-3 hover:shadow-soft transition-all">
              <p className="font-semibold text-sm">{m.modelName} · {m.modelNo}</p>
              <p className="text-xs text-muted-foreground">{m.brandName || "Unknown brand"} · {m.category}</p>
            </button>
          ))}
        </div>
      )}
      {selectedModel && mode === "update" && (
        <>
          <div className="flex items-center justify-between"><p className="text-sm font-semibold">Editing: {selectedModel.modelName}</p><button onClick={() => setSelectedModel(null)} className="text-xs text-primary font-semibold hover:underline">Change</button></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Model Name</label><input value={form.modelName} onChange={e => setForm((f: any) => ({ ...f, modelName: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Model No</label><input value={form.modelNo} onChange={e => setForm((f: any) => ({ ...f, modelNo: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Category</label><select value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))} className={inputCls + " mt-1"}><option value="hand_watches">Hand Watches</option><option value="wall_clocks">Wall Clocks</option></select></div>
            <div><label className={labelCls}>Brand</label><select value={form.brandId} onChange={e => setForm((f: any) => ({ ...f, brandId: e.target.value }))} className={inputCls + " mt-1"}><option value="">Keep current</option>{brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          </div>
          <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} className={inputCls + " mt-1 !h-auto py-3 resize-none"} /></div>
          <div><label className={labelCls}>Image URL</label><input value={form.imageryUrl} onChange={e => setForm((f: any) => ({ ...f, imageryUrl: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <button onClick={() => setConfirm(true)} className="w-full gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow">Update Model</button>
          {confirm && <ConfirmDialog title="Update Model" message="Apply changes?" onConfirm={handleUpdate} onCancel={() => setConfirm(false)} loading={loading} />}
        </>
      )}
      {selectedModel && mode === "delete" && (
        <>
          <div className="glass-soft rounded-2xl p-4 space-y-2">
            <p className="font-bold text-lg">{selectedModel.modelName}</p>
            <p className="text-sm text-muted-foreground">{selectedModel.modelNo} · {selectedModel.category}</p>
            {selectedModel.description && <p className="text-sm">{selectedModel.description}</p>}
          </div>
          <button onClick={() => setConfirm(true)} className="w-full bg-destructive/10 text-destructive border-2 border-destructive/30 rounded-2xl h-12 font-semibold hover:bg-destructive/20 transition-all flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" /> Delete Model</button>
          {confirm && <ConfirmDialog title="Delete Model" message="This will remove the model. Proceed?" onConfirm={handleDelete} onCancel={() => setConfirm(false)} loading={loading} />}
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Brand CRUD
// ══════════════════════════════════════════════════════════════════════════
const BrandCrud = ({ mode }: { mode: CrudMode }) => {
  const [form, setForm] = useState<any>({ name: "", manufacturedCountry: "", logoUrl: "", isActive: true });
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode !== "add") {
        if (searchQ.trim()) searchBrands();
        else setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ, mode]);

  const searchBrands = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    try {
      const res = await api.brands.search(searchQ);
      setSearchResults(res);
    } catch { toast.error("Search failed"); }
    finally { setSearching(false); }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.brands.create({ name: form.name, manufacturedCountry: form.manufacturedCountry, logoUrl: form.logoUrl || null, isActive: form.isActive });
      toast.success("Brand added!");
      setForm({ name: "", manufacturedCountry: "", logoUrl: "", isActive: true });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); setConfirm(false); }
  };

  const handleUpdate = async () => {
    if (!selectedBrand) return;
    setLoading(true);
    try {
      await api.brands.update(selectedBrand.id, {
        name: form.name || undefined, manufacturedCountry: form.manufacturedCountry || undefined,
        logoUrl: form.logoUrl || undefined, isActive: form.isActive,
      });
      toast.success("Brand updated!");
      setSelectedBrand(null); setSearchResults([]);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); setConfirm(false); }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;
    setLoading(true);
    try {
      await api.brands.delete(selectedBrand.id);
      toast.success("Brand deleted!");
      setSelectedBrand(null); setSearchResults([]);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); setConfirm(false); }
  };

  if (mode === "add") {
    return (
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Name *</label><input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Manufactured Country *</label><input value={form.manufacturedCountry} onChange={e => setForm((f: any) => ({ ...f, manufacturedCountry: e.target.value }))} className={inputCls + " mt-1"} /></div>
        </div>
        <div><label className={labelCls}>Logo URL</label><input value={form.logoUrl} onChange={e => setForm((f: any) => ({ ...f, logoUrl: e.target.value }))} className={inputCls + " mt-1"} /></div>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <div className={cn("h-5 w-5 rounded-md border-2 grid place-items-center transition-all", form.isActive ? "bg-primary border-primary text-primary-foreground" : "border-border")}>
            {form.isActive && <Check className="h-3 w-3" />}
          </div>
          Active
        </label>
        <button onClick={() => setConfirm(true)} disabled={!form.name || !form.manufacturedCountry} className="w-full gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-40">Add Brand</button>
        {confirm && <ConfirmDialog title="Add Brand" message="Add this brand?" onConfirm={handleAdd} onCancel={() => setConfirm(false)} loading={loading} />}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && searchBrands()} placeholder="Search brand by name..." className={inputCls + " w-full pr-10"} />
          {searching && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
        <button onClick={searchBrands} disabled={searching} className="h-11 px-5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow flex items-center gap-2">
          <Search className="h-4 w-4" /> Search
        </button>
      </div>
      {searchResults.length > 0 && !selectedBrand && (
        <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
          {searchResults.map((b: any) => (
            <button key={b.id} onClick={() => {
              setSelectedBrand(b);
              if (mode === "update") setForm({ name: b.name || "", manufacturedCountry: b.manufacturedCountry || "", logoUrl: b.logoUrl || "", isActive: b.isActive ?? true });
            }} className="w-full text-left glass rounded-2xl p-3 hover:shadow-soft transition-all">
              <p className="font-semibold text-sm">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.manufacturedCountry} · {b.isActive ? "Active" : "Inactive"}</p>
            </button>
          ))}
        </div>
      )}
      {selectedBrand && mode === "update" && (
        <>
          <div className="flex items-center justify-between"><p className="text-sm font-semibold">Editing: {selectedBrand.name}</p><button onClick={() => setSelectedBrand(null)} className="text-xs text-primary font-semibold hover:underline">Change</button></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Name</label><input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className={inputCls + " mt-1"} /></div>
            <div><label className={labelCls}>Country</label><input value={form.manufacturedCountry} onChange={e => setForm((f: any) => ({ ...f, manufacturedCountry: e.target.value }))} className={inputCls + " mt-1"} /></div>
          </div>
          <div><label className={labelCls}>Logo URL</label><input value={form.logoUrl} onChange={e => setForm((f: any) => ({ ...f, logoUrl: e.target.value }))} className={inputCls + " mt-1"} /></div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <div className={cn("h-5 w-5 rounded-md border-2 grid place-items-center transition-all", form.isActive ? "bg-primary border-primary text-primary-foreground" : "border-border")} onClick={() => setForm((f: any) => ({ ...f, isActive: !f.isActive }))}>
              {form.isActive && <Check className="h-3 w-3" />}
            </div>
            Active
          </label>
          <button onClick={() => setConfirm(true)} className="w-full gradient-primary text-primary-foreground rounded-2xl h-12 font-semibold shadow-glow">Update Brand</button>
          {confirm && <ConfirmDialog title="Update Brand" message="Apply changes?" onConfirm={handleUpdate} onCancel={() => setConfirm(false)} loading={loading} />}
        </>
      )}
      {selectedBrand && mode === "delete" && (
        <>
          <div className="glass-soft rounded-2xl p-4 space-y-2">
            <p className="font-bold text-lg">{selectedBrand.name}</p>
            <p className="text-sm text-muted-foreground">{selectedBrand.manufacturedCountry} · {selectedBrand.isActive ? "Active" : "Inactive"}</p>
          </div>
          <button onClick={() => setConfirm(true)} className="w-full bg-destructive/10 text-destructive border-2 border-destructive/30 rounded-2xl h-12 font-semibold hover:bg-destructive/20 transition-all flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" /> Delete Brand</button>
          {confirm && <ConfirmDialog title="Delete Brand" message="This will remove the brand permanently." onConfirm={handleDelete} onCancel={() => setConfirm(false)} loading={loading} />}
        </>
      )}
    </div>
  );
};

export default Inventory;