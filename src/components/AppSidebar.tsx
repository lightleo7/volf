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
    // { id: "dualMode" as ActiveTab, title: "Совместный просмотр", icon: Video },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="none" className="border-r border-slate-800 bg-slate-950 text-slate-200">
      <SidebarContent>
        <SidebarGroup>
          {/* Логотип приложения */}
          <div className="flex items-center gap-2 px-2 py-4 text-emerald-400 font-bold text-lg tracking-wider">
            <Video className="w-6 h-6 text-emerald-400" />
            <span>VOLF</span>
          </div>
          
          <SidebarGroupLabel className="text-slate-500 font-medium px-2 pb-2">Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 me-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-emerald-600 text-white font-medium hover:bg-emerald-600 hover:text-white" 
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                      }`}
                    >
                      <div>
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{item.title}</span>
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
