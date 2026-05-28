import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, PaymentBadge } from "@/components/dashboard/Badges";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orders, ORDER_STATUSES, inr } from "@/lib/mock-data";
import { Filter, Download, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/distributor/orders")({
  head: () => ({ meta: [{ title: "Orders — Distributor" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? orders : orders.filter((o) => o.status === active);

  return (
    <>
      <Topbar title="Orders" subtitle="Track every order across its lifecycle." />
      <main className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...ORDER_STATUSES].map((s) => (
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
              <Input className="pl-9 w-56 h-9" placeholder="Search orders…" />
            </div>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1.5" /> Filters</Button>
            <Button size="sm"><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          </div>
        </div>

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
                  {filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{o.retailer}</TableCell>
                      <TableCell>{new Date(o.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="text-right tabular-nums">{o.items}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{inr(o.amount)}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell><PaymentBadge status={o.payment} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
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
