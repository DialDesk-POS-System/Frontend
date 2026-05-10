import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex">
    <Sidebar />
    <main className="flex-1 p-3 pl-5 overflow-x-hidden">
      <div className="animate-fade-in">{children}</div>
    </main>
  </div>
);
