import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr, daysUntil, normalizeProduct } from "@/lib/api-adapters";
import { ExpiryBadge, StockBadge, FifoTag } from "@/components/dashboard/Badges";
import { StatCard } from "@/components/dashboard/StatCard";
import { Boxes, AlertTriangle, Clock, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllProducts } from "@/api/products";

export const Route = createFileRoute("/distributor/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Distributor" }] }),
  component: Inventory,
});

function Inventory() {
  const [products, setProducts] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllProducts();
        setProducts((data as Array<Record<string, unknown>>).map(normalizeProduct));
      } catch (err: unknown) {
        setError("Unable to load inventory. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sorted = [...products].sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
  const lowCount = products.filter((p) => p.stock < 10).length;
  const expCount = products.filter((p) => daysUntil(p.expiryDate) <= 30).length;
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
                    <TableHead>Category</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Mfg</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">
                        Loading inventory…
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm text-destructive">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : sorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((p) => {
                      const lowStock = p.stock < 10;
                      const nearExpiry = !lowStock && daysUntil(p.expiryDate) <= 30;
                      return (
                        <TableRow
                          key={p.id}
                          className={
                            lowStock
                              ? "bg-destructive/10 text-destructive"
                              : nearExpiry
                              ? "bg-warning/10 text-warning-foreground"
                              : ""
                          }
                        >
                          <TableCell>
                            <div className="font-medium flex items-center gap-2">{p.name ?? p.productName} {p.id === sorted[0]?.id && <FifoTag />}</div>
                            <div className="text-xs text-muted-foreground">{p.manufacturer ?? p.description}</div>
                          </TableCell>
                          <TableCell className="text-sm">{p.category}</TableCell>
                          <TableCell className="font-mono text-xs">{p.batch ?? p.batchNumber}</TableCell>
                          <TableCell>{p.mfgDate || p.manufacturingDate ? new Date(String(p.mfgDate ?? p.manufacturingDate)).toLocaleDateString("en-IN") : "-"}</TableCell>
                          <TableCell>{p.expiryDate ? new Date(String(p.expiryDate)).toLocaleDateString("en-IN") : "-"}</TableCell>
                          <TableCell>{p.stock}</TableCell>
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
