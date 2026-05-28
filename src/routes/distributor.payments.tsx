import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentBadge } from "@/components/dashboard/Badges";
import { StatCard } from "@/components/dashboard/StatCard";
import { orders, inr } from "@/lib/mock-data";
import { Wallet, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/distributor/payments")({
  head: () => ({ meta: [{ title: "Payments — Distributor" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const collected = orders.filter((o) => o.payment === "Paid").reduce((a, o) => a + o.amount, 0);
  const pending = orders.filter((o) => o.payment === "Pending").reduce((a, o) => a + o.amount, 0);
  const overdue = orders.filter((o) => o.payment === "Overdue").reduce((a, o) => a + o.amount, 0);
  const credit = orders.filter((o) => o.payment === "Credit").reduce((a, o) => a + o.amount, 0);

  return (
    <>
      <Topbar title="Payments" subtitle="Track collections, dues and overdue invoices." />
      <main className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Collected" value={inr(collected)} icon={CheckCircle2} tone="success" />
          <StatCard label="Pending" value={inr(pending)} icon={Clock} tone="info" />
          <StatCard label="On credit" value={inr(credit)} icon={Wallet} tone="primary" />
          <StatCard label="Overdue" value={inr(overdue)} icon={AlertTriangle} tone="destructive" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Order date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">INV-{o.id.replace("ORD-", "")}</TableCell>
                      <TableCell>{o.retailer}</TableCell>
                      <TableCell>{new Date(o.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{inr(o.amount)}</TableCell>
                      <TableCell><PaymentBadge status={o.payment} /></TableCell>
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
