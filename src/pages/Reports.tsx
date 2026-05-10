import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { salesTrend, brands } from "@/data/mock";
import { Download, FileText, TrendingUp, PieChart, Boxes, ShieldCheck, ArrowDownRight, ArrowUpRight } from "lucide-react";

const reportCards = [
  { icon: FileText, title: "Daily sales", desc: "Itemised list & totals" },
  { icon: TrendingUp, title: "Profit", desc: "Revenue minus cost" },
  { icon: PieChart, title: "Payment split", desc: "Cash / card / bank" },
  { icon: Boxes, title: "Inventory ageing", desc: "30 / 60 / 90+ days" },
  { icon: ShieldCheck, title: "Warranty status", desc: "Active & expiring" },
  { icon: ArrowDownRight, title: "Returns", desc: "Reasons & rates" },
];

const Reports = () => {
  const max = Math.max(...salesTrend.map(s => s.v));
  return (
    <AppLayout>
      <Topbar title="Reports & analytics" subtitle="Profitability, inventory and customer insights" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold">Revenue · this week</h3>
              <p className="text-xs text-muted-foreground">Compared to last week</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-full inline-flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +14.6%</span>
          </div>
          <div className="flex items-end gap-3 h-56">
            {salesTrend.map((d) => (
              <div key={d.d} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div className="w-full rounded-t-xl gradient-primary shadow-glow" style={{ height: `${(d.v / max) * 100}%` }} />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">{d.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">Sales by brand</h3>
          <div className="space-y-3">
            {brands.slice(0, 5).map((b, i) => {
              const pct = [82, 64, 51, 38, 22][i];
              return (
                <div key={b}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium">{b}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map(r => (
          <div key={r.title} className="glass rounded-3xl p-5 hover:shadow-glow transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-2xl gradient-primary grid place-items-center shadow-glow">
                <r.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <button className="h-9 w-9 rounded-xl glass-soft grid place-items-center group-hover:bg-primary-soft">
                <Download className="h-4 w-4" />
              </button>
            </div>
            <h4 className="font-display font-bold text-lg mt-4">{r.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Reports;
