import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, PackagePlus, Shield, RotateCcw, BarChart3, Settings, LogOut, Watch } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pos", label: "Point of Sale", icon: ShoppingCart },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/batches", label: "Batch Import", icon: PackagePlus },
  { to: "/warranty", label: "Warranty", icon: Shield },
  { to: "/returns", label: "Returns", icon: RotateCcw },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="glass-strong rounded-3xl m-3 mr-0 w-[248px] shrink-0 flex flex-col p-5 sticky top-3 h-[calc(100vh-1.5rem)]">
      <div className="flex items-center gap-3 px-2 pb-6">
        <div className="h-11 w-11 rounded-2xl gradient-primary grid place-items-center shadow-glow">
          <Watch className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
        </div>
        <div>
          <p className="font-display font-bold text-lg leading-none">CHRONOS</p>
          <p className="text-[11px] text-muted-foreground tracking-wider mt-1">WATCH POS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-foreground/70 hover:text-foreground hover:bg-primary-soft/60"
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 pt-4 border-t border-border/60">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-primary-soft text-primary grid place-items-center font-semibold text-xs">FM</div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Floyd Miles</p>
            <p className="text-[11px] text-muted-foreground">Cashier</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
