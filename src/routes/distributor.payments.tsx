import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentBadge } from "@/components/dashboard/Badges";
import { StatCard } from "@/components/dashboard/StatCard";
import { inr } from "@/lib/mock-data";
import { Wallet, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getPayments } from "@/api/payments";

export const Route = createFileRoute("/distributor/payments")({
  head: () => ({ meta: [{ title: "Payments — Distributor" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [payments, setPayments] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (err: unknown) {
      setError("Unable to load payments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const collected = payments.filter((p) => p.status === "Paid").reduce((a, p) => a + Number(p.amount || 0), 0);
  const pending = payments.filter((p) => p.status === "Pending").reduce((a, p) => a + Number(p.amount || 0), 0);
  const overdue = payments.filter((p) => p.status === "Overdue").reduce((a, p) => a + Number(p.amount || 0), 0);
  const credit = payments.filter((p) => p.status === "Credit").reduce((a, p) => a + Number(p.amount || 0), 0);

  return (
    <>
      <Topbar title="Payments" subtitle="Track collections, dues and overdue invoices." />
      <main className="p-4 sm:p-6 space-y-6">
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        ) : null}

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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">Loading payments…</TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">No payments found.</TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => {
                      const invoiceId = String(p.order_id ?? p.id ?? "").replace("ORD-", "");
                      const orderDate = p.date || p.createdAt || p.order_date;
                      const dateLabel = orderDate ? new Date(orderDate).toLocaleDateString("en-IN") : "-";
                      return (
                        <TableRow key={p.id ?? `${p.order_id}-${p.amount}`}> 
                          <TableCell className="font-medium">INV-{invoiceId}</TableCell>
                          <TableCell>{p.retailer || p.retailerName || "-"}</TableCell>
                          <TableCell>{dateLabel}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{inr(Number(p.amount) || 0)}</TableCell>
                          <TableCell><PaymentBadge status={p.status ?? p.method ?? "Pending"} /></TableCell>
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
