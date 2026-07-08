import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ActiveTab } from "@/types";

interface LayoutProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export function Layout({ currentTab, onTabChange, children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen bg-slate-900 text-slate-100 antialiased overflow-hidden">
        <AppSidebar currentTab={currentTab} onTabChange={onTabChange} />
        
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-900">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
