"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Repeat,
  Settings,
  Wallet,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Giderler", icon: Receipt },
  { href: "/categories", label: "Kategoriler", icon: Tags },
  { href: "/subscriptions", label: "Abonelikler", icon: Repeat },
  { href: "/notifications", label: "Bildirimler", icon: Bell },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

interface AppSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b bg-gradient-to-r from-primary/10 to-transparent px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight">Expense Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
