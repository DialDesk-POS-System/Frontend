import { Bell, Search } from "lucide-react";

export const Topbar = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  return (
    <header className="flex items-center justify-between gap-4 mb-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle ?? date}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* <div className="glass rounded-2xl flex items-center gap-2 px-4 h-11 w-[280px] hidden md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search products, invoices, serials…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div> */}
        <button className="glass rounded-2xl h-11 w-11 grid place-items-center relative hover:shadow-glow transition-shadow">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>
      </div>
    </header>
  );
};
