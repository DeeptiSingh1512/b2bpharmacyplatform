import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products, inr, daysUntil } from "@/lib/mock-data";
import { ExpiryBadge, StockBadge, FifoTag } from "@/components/dashboard/Badges";
import { StatCard } from "@/components/dashboard/StatCard";
import { Boxes, AlertTriangle, Clock, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/distributor/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Distributor" }] }),
  component: Inventory,
});

function Inventory() {
  const sorted = [...products].sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
  const lowCount = products.filter((p) => p.stock <= 100).length;
  const expCount = products.filter((p) => daysUntil(p.expiryDate) <= 240).length;
  const stockValue = products.reduce((a, p) => a + p.stock * p.price, 0);

  return (
    <>
      <Topbar title="Inventory" subtitle="FIFO-ordered view of every batch on hand." />
      <main className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total SKUs" value={String(products.length)} icon={Boxes} tone="primary" />
          <StatCard label="Stock value" value={inr(stockValue)} icon={IndianRupee} tone="success" />
          <StatCard label="Low stock" value={String(lowCount)} icon={AlertTriangle} tone="destructive" />
          <StatCard label="Near expiry" value={String(expCount)} icon={Clock} tone="warning" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch ledger</CardTitle>
            <p className="text-xs text-muted-foreground">Sorted FIFO — earliest expiry first.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Mfg</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">{p.name} {i === 0 && <FifoTag />}</div>
                        <div className="text-xs text-muted-foreground">{p.manufacturer}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.batch}</TableCell>
                      <TableCell>{new Date(p.mfgDate).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{new Date(p.expiryDate).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell><ExpiryBadge days={daysUntil(p.expiryDate)} /></TableCell>
                      <TableCell><StockBadge stock={p.stock} /></TableCell>
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
