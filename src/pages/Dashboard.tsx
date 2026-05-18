import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { useAnalytics } from "@/hooks/use-analytics";
import { useOrders } from "@/hooks/use-orders";
import { useSales } from "@/hooks/use-sales";
import { useWatches } from "@/hooks/use-watches";
import { ArrowUpRight, DollarSign, Package, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";

const Dashboard = () => {
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics();

  const {
    watches,
    loading: watchesLoading,
    error: watchesError,
  } = useWatches();

  const {
    sales,
    loading: salesLoading,
    error: salesError,
  } = useSales();

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
  } = useOrders();

  const recentSales = sales.slice(0, 10);

  const stats = [
    { label: "Today's Revenue", value: `${"$" + analytics.todayRevenue}`, delta: "+18.2%", icon: DollarSign, accent: "from-emerald-400/30 to-emerald-600/20" },
    { label: "Orders", value: `${orders.length}`, delta: "+6", icon: ShoppingBag, accent: "from-teal-400/30 to-teal-600/20" },
    { label: "Stock Units", value: `${watches.length}`, delta: "−4", icon: Package, accent: "from-lime-400/30 to-lime-600/20" },
    { label: "Profit Margin", value: `${analytics.todayRevenue}`, delta: "+1.4%", icon: TrendingUp, accent: "from-green-400/30 to-emerald-600/20" },
  ];

  const computedSalesTrend = useMemo(() => {
    const trend = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
      
      const daySales = sales.filter(s => {
        if (!s.saleDate) return false;
        const saleDate = new Date(s.saleDate);
        return saleDate.getDate() === d.getDate() &&
               saleDate.getMonth() === d.getMonth() &&
               saleDate.getFullYear() === d.getFullYear();
      });
      
      const totalForDay = daySales.reduce((sum, current) => sum + Number(current.totalAmount || current.total || 0), 0);
      
      trend.push({ d: dayStr, v: totalForDay });
    }
    return trend;
  }, [sales]);

  console.log(computedSalesTrend)
  const max = Math.max(...computedSalesTrend.map(s => s.v), 1);
  return (
    <AppLayout>
      <Topbar title="Welcome back, Floyd 👋" subtitle="Here's what's happening at Chronos today." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass rounded-3xl p-5 relative overflow-hidden group hover:shadow-glow transition-all duration-500">
            <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.accent} blur-2xl`} />
            <div className="flex items-start justify-between relative">
              <div className="h-11 w-11 rounded-2xl gradient-primary grid place-items-center shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-full">{s.delta}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-5">{s.label}</p>
            <p className="font-display text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-bold">Sales overview</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
              View report <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex items-end gap-3 h-52">
            {computedSalesTrend.map((d, i) => (
              <div key={d.d} className="flex-1 flex flex-col items-center gap-2 h-full">
                <div className="w-full relative flex-1">
                  <div
                    className="absolute bottom-0 w-full rounded-t-xl gradient-primary shadow-glow transition-all duration-700"
                    style={{ height: `${(d.v / max) * 100}%`, animationDelay: `${i * 60}ms` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">{d.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Low stock</h3>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div className="space-y-3">
            {analytics.lowStockModels?.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border/50 rounded-2xl">
                All models are well stocked!
              </div>
            ) : (
              analytics.lowStockModels?.map(a => (
                <div key={a.modelNo} className="glass-soft rounded-2xl p-3 flex items-center gap-3">
                  <img src={a.imageryUrl} alt={a.modelName} className="h-10 w-10 rounded-xl object-cover bg-secondary/50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.modelName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.modelNo}</p>
                  </div>
                  <span className="text-xs font-bold text-warning bg-warning/15 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {watches.filter(w => w.modelNo == a.modelNo).length} left
                  </span>
                </div>
              ))
            )}
          </div>
          <h4 className="font-display font-bold mt-6 mb-3">Top picks</h4>
          <div className="space-y-3">
            {watches.slice(0, 3).map(w => (
              <div key={w.id} className="flex items-center gap-3">
                <img src={w.imageryUrl} alt={w.modelName} loading="lazy" className="h-11 w-11 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{w.modelName}</p>
                  <p className="text-[11px] text-muted-foreground">{w.brandName} · {w.modelName}</p>
                </div>
                <p className="text-sm font-bold text-primary">${w.sellingPrice.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">Recent sales</h3>
          <Link to="/reports" className="text-xs font-semibold text-primary">All transactions →</Link>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 font-semibold">Invoice</th>
                <th className="py-2.5 font-semibold">Customer</th>
                <th className="py-2.5 font-semibold">Items</th>
                <th className="py-2.5 font-semibold">Method</th>
                <th className="py-2.5 font-semibold">Time</th>
                <th className="py-2.5 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm border-t border-border/60">
                    No recent sales found.
                  </td>
                </tr>
              ) : (
                recentSales.map(s => {
                  const methodStr = s.paymentMethod || "";
                  const formattedMethod = methodStr.toLowerCase() === "credit_card" || methodStr.toLowerCase() === "creditcard" ? "Credit Card" 
                                        : methodStr.toLowerCase() === "debit_card" ? "Debit Card"
                                        : methodStr.toLowerCase() === "cash" ? "Cash" 
                                        : methodStr.toLowerCase() === "bank_transfer" ? "Bank Transfer"
                                        : methodStr.charAt(0).toUpperCase() + methodStr.slice(1).replace('_', ' ');
                  
                  return (
                    <tr key={s.invoiceNo} className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors">
                      <td className="py-3 font-semibold text-primary">{s.invoice || s.invoiceNo}</td>
                      <td className="py-3">{s.customer || s.customerName || "-"}</td>
                      <td className="py-3">{s.items || s.saleItems?.length || 0}</td>
                      <td className="py-3"><span className="px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">{formattedMethod}</span></td>
                      <td className="py-3 text-muted-foreground">{s.saleDate ? new Date(s.saleDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "-"}</td>
                      <td className="py-3 font-bold text-right">${(s.total || s.totalAmount || 0).toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
