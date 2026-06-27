import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, PaymentBadge } from "@/components/dashboard/Badges";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ORDER_STATUSES } from "@/lib/mock-data";
import { inr, normalizeOrder } from "@/lib/api-adapters";
import { Filter, Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "@/api/orders";

export const Route = createFileRoute("/distributor/orders")({
  head: () => ({ meta: [{ title: "Orders — Distributor" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<Array<any>>([]);
  const [active, setActive] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChanges, setStatusChanges] = useState<Record<string | number, string>>({});
  const [savingId, setSavingId] = useState<string | number | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders((data as Array<Record<string, unknown>>).map(normalizeOrder));
    } catch (err: unknown) {
      setError("Unable to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = active === "All" ? orders : orders.filter((o) => o.status === active);

  const handleStatusChange = (id: string | number, value: string) => {
    setStatusChanges((prev) => ({ ...prev, [id]: value }));
  };

  const saveStatus = async (id: string | number) => {
    const order = orders.find((o) => o.id === id);
    const selectedStatus = statusChanges[id] ?? order?.status;
    if (!order || !selectedStatus || selectedStatus === order.status) {
      return;
    }

    setSavingId(id);
    setError(null);

    try {
      await updateOrderStatus(id, selectedStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: selectedStatus } : o)));
      setStatusChanges((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: unknown) {
      setError("Unable to update order status. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <Topbar title="Orders" subtitle="Track every order across its lifecycle." />
      <main className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', ...ORDER_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                active === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9 w-56 h-9" placeholder="Search orders…" disabled />
            </div>
            <Button variant="outline" size="sm" disabled><Filter className="h-4 w-4 mr-1.5" /> Filters</Button>
            <Button size="sm" disabled><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        ) : null}

        <Card>
          <CardHeader><CardTitle className="text-base">{filtered.length} orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-sm text-muted-foreground">Loading orders…</TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-sm text-muted-foreground">No orders found.</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((o) => {
                      const selectedStatus = statusChanges[o.id] ?? o.status;
                      const itemCount = Array.isArray(o.items) ? o.items.length : Number(o.items) || 0;
                      return (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.id}</TableCell>
                          <TableCell>{o.retailer || "-"}</TableCell>
                          <TableCell>{o.date ? new Date(o.date).toLocaleDateString("en-IN") : "-"}</TableCell>
                          <TableCell className="text-right tabular-nums">{itemCount}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{inr(Number(o.amount) || 0)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <select
                                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                                value={selectedStatus}
                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              >
                                {['Pending', 'Approved', 'Packed', 'Dispatched', 'Delivered'].map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => saveStatus(o.id)}
                                disabled={savingId === o.id || selectedStatus === o.status}
                              >
                                {savingId === o.id ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell><PaymentBadge status={o.payment} /></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
