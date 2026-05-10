import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { Search, Shield, ShieldCheck, ShieldAlert, ShieldX, QrCode } from "lucide-react";

const rows = [
  { serial: "SK-77182", model: "Aurum Gold Bracelet", invoice: "INV-2025-00139", expires: "2028-03-12", status: "Active" },
  { serial: "CR-44120", model: "Crown Classic Leather", invoice: "INV-2025-00128", expires: "2027-02-08", status: "Active" },
  { serial: "RD-99021", model: "Rosé Diamond Series", invoice: "INV-2025-00112", expires: "2025-05-30", status: "Expiring" },
  { serial: "TR-13007", model: "Trail Pro Digital", invoice: "INV-2025-00088", expires: "2024-11-14", status: "Expired" },
  { serial: "HW-22118", model: "Heritage Wall Clock", invoice: "INV-2025-00075", expires: "2026-01-22", status: "Claimed" },
];

const statusStyle: Record<string, { bg: string; icon: any }> = {
  Active: { bg: "bg-primary-soft text-primary", icon: ShieldCheck },
  Expiring: { bg: "bg-warning/15 text-warning-foreground", icon: ShieldAlert },
  Expired: { bg: "bg-destructive/15 text-destructive", icon: ShieldX },
  Claimed: { bg: "bg-secondary text-secondary-foreground", icon: Shield },
};

const Warranty = () => {
  return (
    <AppLayout>
      <Topbar title="Warranty centre" subtitle="Look up coverage by serial or invoice" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Active", value: 184, tone: "text-primary" },
          { label: "Expiring 30d", value: 12, tone: "text-warning" },
          { label: "Expired", value: 38, tone: "text-destructive" },
          { label: "Claimed", value: 7, tone: "text-foreground" },
        ].map(s => (
          <div key={s.label} className="glass rounded-3xl p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`font-display text-3xl font-bold mt-1 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 flex-1 min-w-[260px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search by serial number or invoice…" className="bg-transparent outline-none text-sm flex-1" />
          </div>
          <button className="glass-soft rounded-2xl h-11 px-4 text-sm font-medium flex items-center gap-2"><QrCode className="h-4 w-4" /> Scan QR</button>
          <button className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold shadow-glow">Record claim</button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 font-semibold">Serial</th>
                <th className="py-3 font-semibold">Model</th>
                <th className="py-3 font-semibold">Invoice</th>
                <th className="py-3 font-semibold">Expires</th>
                <th className="py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const s = statusStyle[r.status];
                const Icon = s.icon;
                return (
                  <tr key={r.serial} className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors">
                    <td className="py-3 font-mono text-xs font-semibold">{r.serial}</td>
                    <td className="py-3">{r.model}</td>
                    <td className="py-3 text-primary font-semibold">{r.invoice}</td>
                    <td className="py-3 text-muted-foreground">{r.expires}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                        <Icon className="h-3 w-3" /> {r.status}
                      </span>
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

export default Warranty;
