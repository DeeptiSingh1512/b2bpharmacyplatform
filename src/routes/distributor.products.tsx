import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ExpiryBadge, StockBadge, FifoTag } from "@/components/dashboard/Badges";
import { Plus, Trash2, Pencil, Upload, Download, Search, Filter, X } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { normalizeProduct } from "@/lib/api-adapters";
import { EditProductDialog } from "@/components/ui/edit-product-dialog";
import { categories } from "@/lib/mock-data";
import {
  useGetAllProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useImportProductsMutation,
} from "@/store/api/api";
import type { Product } from "@/types";

export const Route = createFileRoute("/distributor/products")({
  head: () => ({ meta: [{ title: "Products — Distributor" }] }),
  component: ProductsPage,
});

// ── CSV helpers ────────────────────────────────────────────────────────────────

const CSV_HEADERS = ["productID", "productName", "title", "description", "image", "category", "price", "stock", "hsnCode", "batchNumber", "expiryDate"];

function productsToCSV(products: Product[]): string {
  const rows = products.map((p) =>
    [
      p.id ?? "",
      p.productName ?? p.name ?? "",
      p.title ?? p.productName ?? p.name ?? "",
      (p.description ?? "").replace(/,/g, ";"),
      p.imageUrl ?? p.image ?? "",
      p.category ?? "",
      p.price ?? "",
      p.stock ?? "",
      p.hsnCode ?? p.hsn ?? "",
      p.batchNumber ?? p.batch ?? "",
      p.expiryDate ?? "",
    ].join(",")
  );
  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

function parseCSV(text: string): Partial<Product>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (values[i] ?? "").trim(); });
    return {
      productName: obj["productname"] || obj["name"] || obj["title"] || "",
      title: obj["title"] || "",
      description: obj["description"] || "",
      imageUrl: obj["image"] || obj["imageurl"] || "",
      category: obj["category"] || "",
      price: obj["price"] ? Number(obj["price"]) : undefined,
      stock: obj["stock"] ? Number(obj["stock"]) : undefined,
      hsnCode: obj["hsncode"] || obj["hsn"] || "",
      batchNumber: obj["batchnumber"] || obj["batch"] || "",
      expiryDate: obj["expirydate"] || "",
    } as Partial<Product>;
  }).filter((p) => p.productName);
}

// ── Page ───────────────────────────────────────────────────────────────────────

function ProductsPage() {
  // RTK Query hooks
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { data: rawProducts = [], isLoading, error: fetchError, refetch } = useGetAllProductsQuery(filters);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [importProducts] = useImportProductsMutation();

  const products = rawProducts.map(normalizeProduct);

  // UI state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Confirm delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Import state
  const fileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ ok: number; failed: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const name = (p.productName ?? p.name ?? "").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "low" && Number(p.stock) > 0 && Number(p.stock) <= 20) ||
      (stockFilter === "out" && Number(p.stock) === 0) ||
      (stockFilter === "ok" && Number(p.stock) > 20);
    return matchSearch && matchCat && matchStock;
  });

  const hasActiveFilters = search || categoryFilter !== "all" || stockFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("all");
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id).unwrap();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  };

  const handleSaveEdit = useCallback(async (id: string | number, data: Partial<Product>) => {
    setIsSaving(true);
    try {
      await updateProduct({ id, body: data }).unwrap();
      setEditTarget(null);
    } finally {
      setIsSaving(false);
    }
  }, [updateProduct]);

  const handleExportCSV = () => {
    const csv = productsToCSV(filtered.length ? filtered : products);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportStatus(null);
    const text = await file.text();
    const parsed = parseCSV(text);
    if (!parsed.length) {
      setImportError("No valid rows found. Check the CSV format.");
      e.target.value = "";
      return;
    }
    try {
      const result = await importProducts({ products: parsed }).unwrap();
      setImportStatus({ ok: result.imported, failed: result.failed?.length ?? 0 });
    } catch {
      setImportError("Import failed. Please try again.");
    }
    e.target.value = "";
  };

  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

  return (
    <>
      <Topbar title="Products" subtitle="Catalog of SKUs available across batches." />

      <main className="p-4 sm:p-6 space-y-4">

        {/* ── Top bar ── */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {products.length} products · {totalStock.toLocaleString("en-IN")} units in stock
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
              <Filter className="h-4 w-4 mr-1.5" /> Filters {hasActiveFilters && <span className="ml-1 h-2 w-2 rounded-full bg-primary inline-block" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1.5" /> Import CSV
            </Button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
            <Button asChild size="sm">
              <Link to="/distributor/products/new"><Plus className="h-4 w-4 mr-1.5" /> Add product</Link>
            </Button>
          </div>
        </div>

        {/* ── CSV template hint ── */}
        <p className="text-xs text-muted-foreground">
          CSV columns: <code className="bg-muted px-1 rounded text-xs">{CSV_HEADERS.join(", ")}</code>
        </p>

        {/* ── Filter bar ── */}
        {showFilters && (
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px] space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Product name…"
                    className="pl-8 h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="min-w-[160px] space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[140px] space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Stock</label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stock</SelectItem>
                    <SelectItem value="ok">In stock (&gt;20)</SelectItem>
                    <SelectItem value="low">Low stock (1–20)</SelectItem>
                    <SelectItem value="out">Out of stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* ── Import / fetch status banners ── */}
        {fetchError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between">
            <span>Unable to load products. Please try again.</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        )}
        {importError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{importError}</div>
        )}
        {importStatus && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center justify-between">
            <span>✓ Imported {importStatus.ok} products{importStatus.failed > 0 ? ` · ${importStatus.failed} rows failed` : ""}.</span>
            <Button variant="ghost" size="sm" onClick={() => setImportStatus(null)}>Dismiss</Button>
          </div>
        )}

        {/* ── Table ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Catalog</CardTitle>
          </CardHeader>
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
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                        Loading products…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                        {hasActiveFilters ? "No products match your filters." : "No products found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p, i) => (
                      <TableRow key={p.id} className="group">
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            {p.productName ?? p.name}
                            {i === 0 && <FifoTag />}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description || "—"}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs rounded-full bg-muted px-2 py-0.5">{p.category || "—"}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.hsnCode || "—"}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {typeof p.price === "number" ? `₹${p.price.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <StockBadge stock={Number(p.stock) || 0} />
                        </TableCell>
                        <TableCell>
                          {p.expiryDate ? <ExpiryBadge expiryDate={p.expiryDate} /> : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditTarget(p)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(p)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.productName ?? deleteTarget?.name}</strong> will be permanently removed from your catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit Dialog ── */}
      <EditProductDialog
        product={editTarget}
        open={!!editTarget}
        isSaving={isSaving}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSave={handleSaveEdit}
      />
    </>
  );
}
