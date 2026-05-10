import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { Search, RotateCcw, RefreshCw, Wallet } from "lucide-react";

const returns = [
  { id: "RET-0042", invoice: "INV-2025-00131", item: "Trail Pro Digital", reason: "Defective", outcome: "Refund", value: 129.5, date: "2025-04-21" },
  { id: "RET-0041", invoice: "INV-2025-00126", item: "Crown Classic Leather", reason: "Wrong color", outcome: "Exchange", value: 0, date: "2025-04-19" },
  { id: "RET-0040", invoice: "INV-2025-00118", item: "Heritage Wall Clock", reason: "Cosmetic damage", outcome: "Store credit", value: 79, date: "2025-04-15" },
];

const Returns = () => (
  <AppLayout>
    <Topbar title="Returns & exchanges" subtitle="Process refunds, exchanges and store credit" />

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Look up by invoice number…" className="bg-transparent outline-none text-sm flex-1" />
          </div>
          <button className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold shadow-glow">New return</button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 font-semibold">Return</th>
                <th className="py-3 font-semibold">Invoice</th>
                <th className="py-3 font-semibold">Item</th>
                <th className="py-3 font-semibold">Reason</th>
                <th className="py-3 font-semibold">Outcome</th>
                <th className="py-3 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {returns.map(r => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors">
                  <td className="py-3 font-semibold">{r.id}</td>
                  <td className="py-3 text-primary font-semibold">{r.invoice}</td>
                  <td className="py-3">{r.item}</td>
                  <td className="py-3 text-muted-foreground">{r.reason}</td>
                  <td className="py-3"><span className="bg-secondary px-2.5 py-1 rounded-full text-xs font-medium">{r.outcome}</span></td>
                  <td className="py-3 font-bold text-right">${r.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass rounded-3xl p-5 space-y-3">
        <h3 className="font-display text-lg font-bold">Quick actions</h3>
        {[
          { icon: RotateCcw, label: "Process return", desc: "Refund within policy window" },
          { icon: RefreshCw, label: "Start exchange", desc: "Swap for another model" },
          { icon: Wallet, label: "Issue store credit", desc: "Generate credit note" },
        ].map(a => (
          <button key={a.label} className="w-full glass-soft rounded-2xl p-4 flex items-center gap-3 text-left hover:shadow-glow hover:bg-primary-soft transition-all">
            <div className="h-10 w-10 rounded-xl gradient-primary text-primary-foreground grid place-items-center shadow-glow">
              <a.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">{a.label}</p>
              <p className="text-[11px] text-muted-foreground">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default Returns;
