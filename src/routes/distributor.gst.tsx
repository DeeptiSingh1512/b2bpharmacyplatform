import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/StatCard";
import { products, inr } from "@/lib/mock-data";
import { Download, IndianRupee, Percent, FileText } from "lucide-react";

export const Route = createFileRoute("/distributor/gst")({
  head: () => ({ meta: [{ title: "GST Reports — Distributor" }] }),
  component: GstPage,
});

function GstPage() {
  const rows = products.map((p) => {
    const taxable = p.price * p.stock;
    const gst = (taxable * p.gst) / 100;
    return { ...p, taxable, gst, total: taxable + gst };
  });
  const totals = rows.reduce(
    (a, r) => ({ taxable: a.taxable + r.taxable, gst: a.gst + r.gst, total: a.total + r.total }),
    { taxable: 0, gst: 0, total: 0 },
  );

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
      </main>
    </>
  );
}
