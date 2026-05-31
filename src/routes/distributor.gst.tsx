import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/StatCard";
import { products, inr } from "@/lib/mock-data";
import { Download, IndianRupee, Percent, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrders } from "@/api/orders";
import { apiClient } from "@/api/config";

export const Route = createFileRoute("/distributor/gst")({
  head: () => ({ meta: [{ title: "GST Reports — Distributor" }] }),
  component: GstPage,
});

function GstPage() {
  const [orders, setOrders] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err: unknown) {
        setError("Unable to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const rows = products.map((p) => {
    const taxable = p.price * p.stock;
    const gst = (taxable * p.gst) / 100;
    return { ...p, taxable, gst, total: taxable + gst };
  });
  const totals = rows.reduce(
    (a, r) => ({ taxable: a.taxable + r.taxable, gst: a.gst + r.gst, total: a.total + r.total }),
    { taxable: 0, gst: 0, total: 0 },
  );

  const downloadInvoice = async (orderId: string | number) => {
    try {
      const response = await apiClient.get(`/invoices/${orderId}`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError("Unable to download invoice. Please try again.");
    }
  };

  return (
    <>
      <Topbar title="GST Reports" subtitle="HSN-wise GST summary · May 2026" />
      <main className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Taxable value" value={inr(totals.taxable)} icon={IndianRupee} tone="primary" />
          <StatCard label="GST collected" value={inr(totals.gst)} icon={Percent} tone="info" />
          <StatCard label="Invoice total" value={inr(totals.total)} icon={FileText} tone="success" />
          <StatCard label="Filings due" value="GSTR-1 · 11 Jun" icon={FileText} tone="warning" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">HSN summary</CardTitle>
            <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HSN</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">GST %</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.hsn}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.stock}</TableCell>
                      <TableCell className="text-right tabular-nums">{inr(r.taxable)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.gst}%</TableCell>
                      <TableCell className="text-right tabular-nums">{inr(r.gst)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{inr(r.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Orders and invoices</CardTitle>
            <div className="text-xs text-muted-foreground">{orders.length} orders</div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.retailer}</TableCell>
                      <TableCell className="text-right tabular-nums">{inr(Number(order.amount) || 0)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => downloadInvoice(order.id)}>
                          <Download className="h-4 w-4 mr-1.5" /> Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading orders…</div>}
              {!isLoading && orders.length === 0 && <div className="p-4 text-sm text-muted-foreground">No orders found.</div>}
            </div>
          </CardContent>
          {error ? <div className="px-4 pb-4 text-sm text-destructive">{error}</div> : null}
        </Card>
      </main>
    </>
  );
}
