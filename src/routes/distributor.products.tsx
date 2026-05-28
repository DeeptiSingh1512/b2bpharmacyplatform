import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products, inr, daysUntil } from "@/lib/mock-data";
import { ExpiryBadge, StockBadge, FifoTag } from "@/components/dashboard/Badges";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/distributor/products")({
  head: () => ({ meta: [{ title: "Products — Distributor" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <>
      <Topbar title="Products" subtitle="Catalog of SKUs available across batches." />
      <main className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{products.length} products · {products.reduce((a, p) => a + p.stock, 0).toLocaleString("en-IN")} units in stock</p>
          <Button asChild size="sm"><Link to="/distributor/products/new"><Plus className="h-4 w-4 mr-1.5" /> Add product</Link></Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Catalog</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">{p.name} {i === 0 && <FifoTag />}</div>
                        <div className="text-xs text-muted-foreground">{p.manufacturer}</div>
                      </TableCell>
                      <TableCell><span className="text-xs rounded-full bg-muted px-2 py-0.5">{p.category}</span></TableCell>
                      <TableCell className="font-mono text-xs">{p.batch}</TableCell>
                      <TableCell className="font-mono text-xs">{p.hsn}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.gst}%</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{inr(p.price)}</TableCell>
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
