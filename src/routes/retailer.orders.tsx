import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PaymentBadge } from "@/components/dashboard/Badges";
import { ORDER_STATUSES } from "@/lib/mock-data";
import { inr, normalizeOrder } from "@/lib/api-adapters";
import { apiClient } from "@/api/config";
import { useEffect, useState } from "react";
import { getOrders } from "@/api/orders";

export const Route = createFileRoute("/retailer/orders")({
  head: () => ({ meta: [{ title: "Order history — Retailer" }] }),
  component: RetailerOrders,
});

function RetailerOrders() {
  const [orders, setOrders] = useState<Array<any>>([]);
  const [active, setActive] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchOrders();
  }, []);

  const filtered = active === "All" ? orders : orders.filter((o) => o.status === active);

  const downloadInvoice = async (orderId: string | number) => {
    try {
      const response = await apiClient.get(`/invoices/${orderId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download invoice.");
    }
  };

  return (
    <>
      <Topbar title="Order history" subtitle="Track every order placed with your distributor." />
      <main className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {["All", ...ORDER_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                active === s ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
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
                      <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">Loading orders…</TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">No orders found.</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((o) => {
                      const itemCount = Array.isArray(o.items) ? o.items.length : Number(o.items) || 0;
                      return (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.id}</TableCell>
                          <TableCell>{o.date ? new Date(o.date).toLocaleDateString("en-IN") : "-"}</TableCell>
                          <TableCell className="text-right tabular-nums">{itemCount}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{inr(Number(o.amount) || 0)}</TableCell>
                          <TableCell><StatusBadge status={o.status} /></TableCell>
                          <TableCell><PaymentBadge status={o.payment} /></TableCell>
                          <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => downloadInvoice(o.id)}>Invoice</Button></TableCell>
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
