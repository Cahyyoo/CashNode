"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  FolderKanban,
  Users2,
  UserCog,
  Wallet,
} from "lucide-react";
import type { Role } from "@/lib/generated/prisma/client";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Proyek", icon: FolderKanban },
  { href: "/departments", label: "Departemen", icon: Building2 },
  { href: "/vendors", label: "Vendor", icon: Users2 },
];

const ADMIN_NAV_ITEMS = [
  { href: "/users", label: "Pengguna", icon: UserCog },
];

export function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Wallet className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">CashNode</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
          Menu
        </p>
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
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary" />
              )}
              <Icon
                className={cn(
                  "size-4",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
