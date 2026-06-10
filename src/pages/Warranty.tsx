import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { api } from "@/services/api";
import {
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  QrCode,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Package,
  Trash2,
  Check,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useWarrenty,useWarrantyById } from "@/hooks/use-warranty";
import { goToPage, pageNumbers } from "@/services/pagination";

const Warranty = () => {
  const [stats, setStats] = useState({
    activeCount: 0,
    expiring30DaysCount: 0,
    expiredCount: 0,
    claimedCount: 0,
  });
  const getWarrantyStatus = (endDate: string, claimDate?: string | null) => {
    if (claimDate) return "Claimed";
    const end = new Date(endDate);
    const now = new Date();
    const days = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (days < 0) return "Expired";
    if (days < 30) return "Expiring";
    return "Active";
  };
  const statusStyle: Record<string, { bg: string; icon: any }> = {
    Active: { bg: "bg-primary-soft text-primary", icon: ShieldCheck },
    Expiring: {
      bg: "bg-warning/15 text-warning-foreground",
      icon: ShieldAlert,
    },
    Expired: { bg: "bg-destructive/15 text-destructive", icon: ShieldX },
    Claimed: { bg: "bg-secondary text-secondary-foreground", icon: Shield },
  };
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const { warranty, loading3 } = useWarrantyById(selectedId);

  // Search states
  const [searchById, setSearchById] = useState("");
  const [searchBySerialInvoice, setSearchBySerialInvoice] = useState("");
  const [searchByCustomer, setSearchByCustomer] = useState("");

  const handleSearchById = () => {
    if (searchById.trim()) {
      setSelectedId(Number(searchById));
    }
  };

const handleDeleteWarranty = async (warrantyId: number) => {
  if (confirm("Are you sure you want to delete this warranty?")) {
    try {
      const res = await api.warranty.delete(warrantyId);
      console.log(res);

    } catch (error) {
      console.error("Failed to delete warranty:", error);
    }
  }
};

const handleClaimWarranty = async (warrantyId: number) => {
  if (confirm("Are you sure you want to claim this warranty?")) {
    try {
      const res = await api.warranty.claim(warrantyId);
      console.log("Warranty claimed successfully:", res);
      await refresh(); 
      alert("Warranty claimed successfully")

    } catch (error) {
      console.error("Failed to claim warranty:", error);
    }
  }
};


  const {
    warranties,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    pageSize,
    refresh,
    setPage
  } = useWarrenty();

    const pages = useMemo(
      () => pageNumbers(page, totalPages),
      [page, totalPages],
    );
  

  useEffect(() => {
    const fetchWarrantyStats = async () => {
      try {
        const response = await api.warranty.getDashboard();

        setStats(response);
        console.log(stats);
      } catch (error) {
        console.log(error);
      }
    };
    fetchWarrantyStats();
  }, []);

  const statsCards = [
    {
      label: "Active",
      value: stats?.activeCount,
      tone: "text-primary",
    },
    {
      label: "Expiring 30d",
      value: stats?.expiring30DaysCount,
      tone: "text-warning",
    },
    {
      label: "Expired",
      value: stats?.expiredCount,
      tone: "text-destructive",
    },
    {
      label: "Claimed",
      value: stats?.claimedCount,
      tone: "text-foreground",
    },
  ];

  return (
    <AppLayout>
      <Topbar
        title="Warranty centre"
        subtitle="Look up coverage by serial or invoice"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {statsCards.map((s) => (
          <div key={s.label} className="glass rounded-3xl p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>

            <p className={`font-display text-3xl font-bold mt-1 ${s.tone}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 flex-1 min-w-[260px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by Id"
              className="bg-transparent outline-none text-sm flex-1"
              value={searchById}
              onChange={(e) => setSearchById(e.target.value)}
              // onKeyPress={(e) => e.key === 'Enter' && handleSearchById()}
            />
          </div>
          <button 
            onClick={handleSearchById}
            className="glass-soft rounded-2xl h-11 px-4 text-sm font-semibold hover:shadow-glow transition-all"
          >
            Search ID
          </button>

          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 flex-1 min-w-[260px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by serial number or invoice…"
              className="bg-transparent outline-none text-sm flex-1"
              value={searchBySerialInvoice}
              onChange={(e) => setSearchBySerialInvoice(e.target.value)}
            />
          </div>
          <button className="glass-soft rounded-2xl h-11 px-4 text-sm font-semibold hover:shadow-glow transition-all">
            Search
          </button>

          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 flex-1 min-w-[260px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by customer…"
              className="bg-transparent outline-none text-sm flex-1"
              value={searchByCustomer}
              onChange={(e) => setSearchByCustomer(e.target.value)}
            />
          </div>
          
          <button className="glass-soft rounded-2xl h-11 px-4 text-sm font-semibold hover:shadow-glow transition-all">
            Search
          </button>
         
          
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 font-semibold">WarrentyId</th>
                <th className="py-3 font-semibold">saleItem Id</th>
                <th className="py-3 font-semibold">Invoice</th>
                <th className="py-3 font-semibold">StartDate</th>
                <th className="py-3 font-semibold">Expires</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">ClaimDate</th>
                <th className="py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading warranties...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-destructive"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && warranties.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No warranties found
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                warranties.map((w) => {
                  const status = getWarrantyStatus(w.endDate, w.claimDate);
                  const s = statusStyle[status];
                  const Icon = s.icon;
                  return (
                    <tr
                      key={w.id}
                      className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors"
                    >
                      <td className="py-3 font-mono text-xs font-semibold cursor-pointer" onClick={()=>setSelectedId(w.id)}>
                        {w.id?? "—"}
                      </td>
                      <td className="py-3 font-mono text-xs font-semibold cursor-pointer" onClick={()=>setSelectedId(w.id)}>
                        {w.saleItemId ?? "—"}
                      </td>
                      <td className="py-3 cursor-pointer" onClick={()=>setSelectedId(w.id)}>{w.invoiceNo ?? "—"}</td>
                      <td className="py-3 text-primary font-semibold cursor-pointer" onClick={()=>setSelectedId(w.id)}>
                        {w.startDate ?? "—"}
                      </td>
                      <td className="py-3 text-muted-foreground cursor-pointer" onClick={()=>setSelectedId(w.id)}>
                        {w.endDate ?? "—"}
                      </td>
                      <td className="py-3 cursor-pointer" onClick={()=>setSelectedId(w.id)}>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}
                        >
                          <Icon className="h-3 w-3" /> {status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground cursor-pointer" onClick={()=>setSelectedId(w.id)}>
                        {w.claimDate ?? "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteWarranty(w.id)}
                            className="h-8 w-8 rounded-lg glass-soft text-destructive hover:shadow-glow transition-all grid place-items-center"
                            title="Delete warranty"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {!w.claimDate && new Date(w.endDate) > new Date() && (
                            <button
                              onClick={() => handleClaimWarranty(w.id)}
                              className="h-8 w-8 rounded-lg glass-soft text-primary hover:shadow-glow transition-all grid place-items-center"
                              title="Claim warranty"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {/* Warranty Details Modal */}
          {selectedId && warranty && (
            <div
              className="fixed inset-0 z-50 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Warranty details"
            >
              <div
                className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                onMouseDown={() => setSelectedId(undefined)}
              />

              <div className="relative mx-auto flex items-center justify-center">
                <div className="relative w-full max-w-6xl glass rounded-3xl shadow-glow border border-border/60 max-h-[85vh] overflow-y-auto">
                  <div className="p-5 flex items-start justify-between gap-4 border-b border-border/50 sticky top-0 bg-inherit rounded-t-3xl">
                    <div>
                      <h3 className="font-display text-lg font-bold">Warranty Details</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Warranty ID: {warranty.id}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedId(undefined)}
                      className="h-10 w-10 rounded-2xl glass-soft grid place-items-center hover:shadow-glow"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Warranty Status */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Warranty Status</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="font-semibold text-sm mt-1">
                            {warranty.isClaimed ? (
                              <span className="text-secondary">Claimed</span>
                            ) : new Date(warranty.endDate) < new Date() ? (
                              <span className="text-destructive">Expired</span>
                            ) : (
                              <span className="text-primary">Active</span>
                            )}
                          </p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Start Date</p>
                          <p className="font-semibold text-sm mt-1">{new Date(warranty.startDate).toLocaleDateString()}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">End Date</p>
                          <p className="font-semibold text-sm mt-1">{new Date(warranty.endDate).toLocaleDateString()}</p>
                        </div>
                        {warranty.claimDate && (
                          <div className="glass-soft rounded-2xl p-3">
                            <p className="text-xs text-muted-foreground">Claim Date</p>
                            <p className="font-semibold text-sm mt-1">{new Date(warranty.claimDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Product Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Brand</p>
                          <p className="font-semibold text-sm mt-1">{warranty.brandName}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Model</p>
                          <p className="font-semibold text-sm mt-1">{warranty.modelName}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Model No</p>
                          <p className="font-semibold text-sm mt-1">{warranty.modelNo}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Color</p>
                          <p className="font-semibold text-sm mt-1">{warranty.color || "—"}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Serial</p>
                          <p className="font-mono text-xs font-semibold mt-1">{warranty.serialNo || "—"}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Watch ID</p>
                          <p className="font-mono text-xs font-semibold mt-1">{warranty.watchId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Sale Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Sale Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Invoice</p>
                          <p className="font-semibold text-sm mt-1">{warranty.invoiceNo}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Sale Date</p>
                          <p className="font-semibold text-sm mt-1">{new Date(warranty.saleDate).toLocaleDateString()}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Sale ID</p>
                          <p className="font-mono text-xs font-semibold mt-1">{warranty.saleId}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Sale Item ID</p>
                          <p className="font-mono text-xs font-semibold mt-1">{warranty.saleItemId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Customer Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Customer Name</p>
                          <p className="font-semibold text-sm mt-1">{warranty.customerName || "—"}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Customer Phone</p>
                          <p className="font-semibold text-sm mt-1">{warranty.customerPhone || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Pricing</h4>
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Unit Price</p>
                          <p className="font-semibold text-sm mt-1 text-primary">${warranty.unitPrice.toFixed(2)}</p>
                        </div>
                        <div className="glass-soft rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground">Line Total</p>
                          <p className="font-semibold text-sm mt-1 text-primary">${warranty.lineTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                      <button
                          onClick={() => handleDeleteWarranty(warranty.id)}
                          className="h-8 w-8 rounded-lg glass-soft text-destructive hover:shadow-glow transition-all grid place-items-center"
                          title="Delete warranty"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      <button
                        onClick={() => setSelectedId(undefined)}
                        className="h-10 px-4 rounded-2xl glass-soft text-sm font-semibold hover:shadow-glow"
                      >
                        Close
                      </button>
                      {!warranty.isClaimed && (
                        <button onClick={()=>handleClaimWarranty(warranty.id)} className="h-10 px-4 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow">
                          Record Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
              {/* Result count */}
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalCount)} of {totalCount}
              </p>

              {/* Page buttons */}
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => goToPage(page - 1, setPage, totalPages)}
                  disabled={page === 1}
                  className="h-8 w-8 rounded-xl glass-soft flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {pages.map((p, idx) => {
                  // Show ellipsis when there's a gap
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
                        onClick={() => goToPage(p, setPage, totalPages )}
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

                {/* Next */}
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
      </div>
    </AppLayout>
  );
};

export default Warranty;
