import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PaymentBadge } from "@/components/dashboard/Badges";
import { orders, inr, ORDER_STATUSES } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/retailer/orders")({
  head: () => ({ meta: [{ title: "Order history — Retailer" }] }),
  component: RetailerOrders,
});

function RetailerOrders() {
  const [active, setActive] = useState<string>("All");
  const mine = orders.filter((o) => o.retailer === "MediPlus Pharmacy" || o.retailer === "City Medicos");
  const filtered = active === "All" ? mine : mine.filter((o) => o.status === active);

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
                  {filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{new Date(o.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="text-right tabular-nums">{o.items}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{inr(o.amount)}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell><PaymentBadge status={o.payment} /></TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="ghost">Invoice</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
