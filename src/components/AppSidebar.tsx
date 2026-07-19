import { Search, History, Settings, Video } from "lucide-react";
import { ActiveTab } from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function AppSidebar({ currentTab, onTabChange }: AppSidebarProps) {
  const menuItems = [
    { id: "search" as ActiveTab, title: "Поиск", icon: Search },
    { id: "history" as ActiveTab, title: "История", icon: History },
    { id: "settings" as ActiveTab, title: "Настройки", icon: Settings },
    { id: "dualMode" as ActiveTab, title: "Совместный просмотр", icon: Video },
  ];

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="none" 
      className="text-slate-200"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-3 px-3 py-6 select-none">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Video className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              VOLF
            </span>
          </div>
          
          <SidebarGroupLabel className="text-slate-500 font-bold px-3 pb-3 uppercase tracking-wider text-[10px]">
            Навигация
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 h-11 cursor-pointer border ${
                        isActive 
                          ? "bg-gradient-to-r from-emerald-500/15 to-teal-600/5 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                          : "text-slate-400 border-transparent hover:bg-white/[0.02] hover:text-slate-100 hover:border-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                          isActive 
                            ? "text-emerald-400 scale-105 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                            : "group-hover:scale-105"
                        }`} />
                        <span className="tracking-wide text-sm uppercase font-semibold">{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}