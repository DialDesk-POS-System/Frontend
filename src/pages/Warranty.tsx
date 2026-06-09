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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useWarrenty } from "@/hooks/use-warranty";
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
  const {
    warranties,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    pageSize,
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
              placeholder="Search by serial number or invoice…"
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
          <button className="glass-soft rounded-2xl h-11 px-4 text-sm font-medium flex items-center gap-2">
            <QrCode className="h-4 w-4" /> Scan QR
          </button>
          <button className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold shadow-glow">
            Record claim
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 font-semibold">saleItemId</th>
                <th className="py-3 font-semibold">Invoice</th>
                <th className="py-3 font-semibold">StartDate</th>
                <th className="py-3 font-semibold">Expires</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">ClaimDate</th>
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
                      <td className="py-3 font-mono text-xs font-semibold">
                        {w.saleItemId ?? "—"}
                      </td>
                      <td className="py-3">{w.invoiceNo ?? "—"}</td>
                      <td className="py-3 text-primary font-semibold">
                        {w.startDate ?? "—"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {w.endDate ?? "—"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}
                        >
                          <Icon className="h-3 w-3" /> {status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {w.claimDate ?? "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

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
