"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Lightbulb,
  Package,
  Users,
  Activity,
  FileSearch,
  FileText,
  Bell,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "ダッシュボード", icon: LayoutDashboard, path: "/dashboard" },
  { label: "インサイト", icon: Lightbulb, path: "/insights" },
  { label: "ブランド管理", icon: Package, path: "/brands" },
  { label: "HCP分析", icon: Users, path: "/hcp" },
  { label: "市場モニタリング", icon: Activity, path: "/monitoring" },
  { label: "分析リクエスト", icon: FileSearch, path: "/requests" },
  { label: "レポート", icon: FileText, path: "/reports" },
  { label: "通知", icon: Bell, path: "/notifications" },
  { label: "設定", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            M
          </div>
          <span className="font-bold text-lg">メディサーチAI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path))}
                  >
                    <Link href={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
