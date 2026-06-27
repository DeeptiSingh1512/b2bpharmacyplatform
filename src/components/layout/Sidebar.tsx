import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { clearAuth } from "@/lib/auth";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Wallet, RotateCcw,
  FileText, Boxes, Search, History, CreditCard, Bell, Pill, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const distributorNav: Item[] = [
  { to: "/distributor", label: "Overview", icon: LayoutDashboard },
  { to: "/distributor/orders", label: "Orders", icon: ShoppingCart },
  { to: "/distributor/products", label: "Products", icon: Package },
  { to: "/distributor/inventory", label: "Inventory", icon: Boxes },
  { to: "/distributor/retailers", label: "Retailers", icon: Users },
  { to: "/distributor/payments", label: "Payments", icon: Wallet },
  { to: "/distributor/returns", label: "Returns", icon: RotateCcw },
  { to: "/distributor/gst", label: "GST Reports", icon: FileText },
];

const retailerNav: Item[] = [
  { to: "/retailer", label: "Browse", icon: Search },
  { to: "/retailer/cart", label: "Cart", icon: ShoppingCart },
  { to: "/retailer/orders", label: "Order history", icon: History },
  { to: "/retailer/credit", label: "Credit", icon: CreditCard },
  { to: "/retailer/returns", label: "Returns", icon: RotateCcw },
  { to: "/retailer/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar({ role }: { role: "distributor" | "retailer" }) {
  const items = role === "distributor" ? distributorNav : retailerNav;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Pill className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-semibold tracking-tight text-sidebar-foreground">MediBridge</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {role === "distributor" ? "Distributor" : "Retailer"}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.to ||
            (item.to !== `/${role}` && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/80"
          onClick={() => {
            clearAuth();
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
