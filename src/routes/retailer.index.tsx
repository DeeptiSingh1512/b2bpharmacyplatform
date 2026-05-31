import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/dashboard/StatCard";
import { products, categories, inr, daysUntil } from "@/lib/mock-data";
import { ExpiryBadge, StockBadge, FifoTag } from "@/components/dashboard/Badges";
import { Search, ShoppingCart, Plus, AlertTriangle, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrders } from "@/api/orders";
import { getNotifications } from "@/api/notifications";

export const Route = createFileRoute("/retailer/")({
  head: () => ({ meta: [{ title: "Browse medicines — Retailer" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [orders, setOrders] = useState<Array<any>>([]);
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [ordersData, notificationsData] = await Promise.all([getOrders(), getNotifications()]);
        setOrders(ordersData);
        setNotifications(notificationsData);
      } catch (err: unknown) {
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const retailerOrders = user
    ? orders.filter(
        (o) =>
          o.retailer_id === user.id ||
          o.retailer === user.name ||
          o.retailerId === user.id ||
          o.retailer === user.email,
      )
    : [];

  const totalOrders = retailerOrders.length;
  const pendingOrders = retailerOrders.filter((o) => String(o.status).toLowerCase() === "pending").length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const recentOrders = retailerOrders.slice(0, 5);

  const filtered = products.filter((p) =>
    (cat === "all" || p.category === cat) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.manufacturer.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <Topbar title="Browse medicines" subtitle="Live catalog · prices update every 15 minutes." />
      <main className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total orders" value={String(totalOrders)} icon={ShoppingCart} tone="primary" />
          <StatCard label="Pending orders" value={String(pendingOrders)} icon={AlertTriangle} tone="warning" />
          <StatCard label="Unread notifications" value={String(unreadNotifications)} icon={Bell} tone="info" />
        </div>

        {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-55 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or manufacturer…" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild className="ml-auto"><Link to="/retailer/cart"><ShoppingCart className="h-4 w-4 mr-1.5" /> View cart</Link></Button>
        </div>

        {recentOrders.length > 0 ? (
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold">Recent orders</h2>
                  <p className="text-xs text-muted-foreground">Your latest orders and statuses.</p>
                </div>
              </div>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-border p-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-xs text-muted-foreground">{order.items} items · {order.status}</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{inr(Number(order.amount) || 0)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => {
            const d = daysUntil(p.expiryDate);
            return (
              <Card key={p.id} className="overflow-hidden border-border/70 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{p.manufacturer}</div>
                      <div className="font-medium truncate">{p.name}</div>
                    </div>
                    {i % 4 === 0 && <FifoTag />}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] rounded-full bg-muted px-2 py-0.5">{p.category}</span>
                    <ExpiryBadge days={d} />
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <div className="text-lg font-semibold tabular-nums">{inr(p.price)}</div>
                      <div className="text-xs text-muted-foreground line-through">MRP {inr(p.mrp)}</div>
                    </div>
                    <StockBadge stock={p.stock} />
                  </div>

                  <Button size="sm" className="w-full" disabled={p.stock < 1}>
                    <Plus className="h-4 w-4 mr-1" /> Add to cart
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
