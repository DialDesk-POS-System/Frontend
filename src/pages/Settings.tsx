import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { Store, Receipt, Bell, Users, Shield, Palette } from "lucide-react";

const sections = [
  { icon: Store, title: "Shop profile", desc: "Name, address, tax ID, currency" },
  { icon: Receipt, title: "Invoice settings", desc: "Numbering, footer, QR base URL" },
  { icon: Bell, title: "Notifications", desc: "Low stock & warranty alerts" },
  { icon: Users, title: "Staff & roles", desc: "Cashier, manager, admin" },
  { icon: Shield, title: "Return policy", desc: "Window, conditions, restock fee" },
  { icon: Palette, title: "Receipt theme", desc: "Logo, colors, layout" },
];

const Settings = () => (
  <AppLayout>
    <Topbar title="Settings" subtitle="Configure your shop, staff and policies" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map(s => (
        <button key={s.title} className="glass rounded-3xl p-5 text-left hover:shadow-glow transition-all duration-500 group">
          <div className="h-11 w-11 rounded-2xl gradient-primary grid place-items-center shadow-glow group-hover:scale-110 transition-transform">
            <s.icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <h4 className="font-display font-bold text-lg mt-4">{s.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
        </button>
      ))}
    </div>
  </AppLayout>
);

export default Settings;
