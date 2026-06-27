import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExpiryBadge, StockBadge, FifoTag } from "@/components/dashboard/Badges";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteProduct, getAllProducts } from "@/api/products";
import { normalizeProduct } from "@/lib/api-adapters";

export const Route = createFileRoute("/distributor/products")({
  head: () => ({ meta: [{ title: "Products — Distributor" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllProducts();
      setProducts((data as Array<Record<string, unknown>>).map(normalizeProduct));
    } catch (err: unknown) {
      setError("Unable to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number | string) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err: unknown) {
      setError("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalStock = products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0);

  return (
    <>
      <Topbar title="Products" subtitle="Catalog of SKUs available across batches." />
      <main className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{products.length} products · {totalStock.toLocaleString("en-IN")} units in stock</p>
          <Button asChild size="sm"><Link to="/distributor/products/new"><Plus className="h-4 w-4 mr-1.5" /> Add product</Link></Button>
        </div>

        {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        <Card>
          <CardHeader><CardTitle className="text-base">Catalog</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">Loading products…</TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">No products found.</TableCell>
                    </TableRow>
                  ) : (
                    products.map((p, i) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">{p.productName ?? p.name} {i === 0 && <FifoTag />}</div>
                          <div className="text-xs text-muted-foreground">{p.description || "-"}</div>
                        </TableCell>
                        <TableCell><span className="text-xs rounded-full bg-muted px-2 py-0.5">{p.category || "-"}</span></TableCell>
                        <TableCell className="font-mono text-xs">{p.hsnCode || "-"}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{typeof p.price === 'number' ? `₹${p.price.toFixed(2)}` : "-"}</TableCell>
                        <TableCell className="text-right tabular-nums"><StockBadge stock={Number(p.stock) || 0} /></TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
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
