import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge, ExpiryBadge, StockBadge } from "@/components/dashboard/Badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IndianRupee, ShoppingBag, Users, AlertTriangle, TrendingUp,
} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { getOrders } from "@/api/orders";
import { getAllProducts } from "@/api/products";
import { getPayments } from "@/api/payments";
import { revenueSeries, categoryShare, retailers, inr, daysUntil } from "@/lib/mock-data";

export const Route = createFileRoute("/distributor/")({
  head: () => ({ meta: [{ title: "Distributor — Overview" }] }),
  component: DistributorOverview,
});

const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function DistributorOverview() {
  const [apiProducts, setApiProducts] = useState<Array<any>>([]);
  const [apiOrders, setApiOrders] = useState<Array<any>>([]);
  const [payments, setPayments] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, ordersData, paymentsData] = await Promise.all([
          getAllProducts(),
          getOrders(),
          getPayments(),
        ]);
        setApiProducts(productsData);
        setApiOrders(ordersData);
        setPayments(paymentsData);
      } catch (err: unknown) {
        setError("Unable to load dashboard data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const pendingRetailers = retailers.filter((r) => r.status === "Pending");
  const lowStock = apiProducts.filter((p) => p.stock <= 100).slice(0, 4);
  const nearExpiry = apiProducts
    .map((p) => ({ ...p, d: daysUntil(p.expiryDate) }))
    .filter((p) => p.d <= 240)
    .sort((a, b) => a.d - b.d)
    .slice(0, 4);

  const totalOrders = apiOrders.length;
  const totalProducts = apiProducts.length;
  const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <>
      <Topbar title="Overview" subtitle="Welcome back, Anjali · MediBridge HQ" />
      <main className="p-4 sm:p-6 space-y-6">
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Orders" value={String(totalOrders)} icon={ShoppingBag} tone="info" />
          <StatCard label="Products" value={String(totalProducts)} icon={Users} tone="success" />
          <StatCard label="Payments" value={inr(totalPayments)} icon={IndianRupee} tone="primary" />
          <StatCard label="Alerts" value="17" delta={-4.0} icon={AlertTriangle} tone="warning" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Revenue & orders</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
              </div>
              <div className="text-xs text-success inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +18.4% QoQ</div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries} margin={{ left: -10, right: 10, top: 10 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => inr(v)}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Category mix</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {categoryShare.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Low stock alerts</CardTitle>
              <Button asChild variant="ghost" size="sm"><Link to="/distributor/inventory">View all</Link></Button>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {lowStock.map((p) => (
                <div key={p.id} className="py-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-destructive/10 text-destructive flex items-center justify-center text-xs font-semibold">{p.stock}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.manufacturer} · Batch {p.batch}</div>
                  </div>
                  <StockBadge stock={p.stock} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Near expiry</CardTitle>
              <Button asChild variant="ghost" size="sm"><Link to="/distributor/inventory">Manage</Link></Button>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {nearExpiry.map((p) => (
                <div key={p.id} className="py-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-warning/25 text-warning-foreground flex items-center justify-center text-[11px] font-semibold">
                    {Math.max(0, Math.round(p.d / 30))}mo
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Exp {new Date(p.expiryDate).toLocaleDateString("en-IN")}</div>
                  </div>
                  <ExpiryBadge days={p.d} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Retailer approvals</CardTitle>
              <Button asChild variant="ghost" size="sm"><Link to="/distributor/retailers">All retailers</Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRetailers.length === 0 && <p className="text-sm text-muted-foreground">No pending requests.</p>}
              {pendingRetailers.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {r.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.owner} · {r.city}</div>
                  </div>
                  <Button size="sm" variant="outline">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Recent orders</CardTitle>
              <Button asChild variant="ghost" size="sm"><Link to="/distributor/orders">View all</Link></Button>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {apiOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{o.id} · {o.retailer}</div>
                    <div className="text-xs text-muted-foreground">{o.items} items · {new Date(o.date).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div className="text-sm font-medium tabular-nums">{inr(Number(o.amount) || 0)}</div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
              {isLoading && <div className="py-3 text-sm text-muted-foreground">Loading recent orders…</div>}
              {!isLoading && apiOrders.length === 0 && <div className="py-3 text-sm text-muted-foreground">No recent orders available.</div>}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
