import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { createProduct } from "@/api/products";
import type { FormEvent } from "react";

export const Route = createFileRoute("/distributor/products/new")({
  head: () => ({ meta: [{ title: "Add product — Distributor" }] }),
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categoryValue, setCategoryValue] = useState(categories[0]);
  const [gstValue, setGstValue] = useState("12");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const productName = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("mfg") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const hsnCode = String(formData.get("hsn") ?? "").trim();
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("qty"));
    const batchNumber = String(formData.get("batch") ?? "").trim();
    const manufacturingDate = String(formData.get("mfgdate") ?? "").trim();
    const expiryDate = String(formData.get("exp") ?? "").trim();

    try {
      await createProduct({
        productName,
        description,
        category,
        hsnCode,
        price,
        stock,
        batchNumber,
        manufacturingDate,
        expiryDate,
      });
      setSuccess("Product created successfully.");
      setTimeout(() => navigate({ to: "/distributor/products" }), 2000);
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err && typeof (err as any).message === "string"
          ? (err as any).message
          : "Failed to save product. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Add product" subtitle="Create a new SKU with batch and tax details." />
      <main className="p-4 sm:p-6">
        <Button asChild variant="ghost" size="sm" className="mb-3"><Link to="/distributor/products"><ArrowLeft className="h-4 w-4 mr-1" /> Back to products</Link></Button>

        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Basic info</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Product name</Label>
                <Input id="name" name="name" placeholder="Amoxicillin 500mg Capsule" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mfg">Manufacturer</Label>
                <Input id="mfg" name="mfg" placeholder="Cipla" required />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={categoryValue} onValueChange={setCategoryValue}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <input type="hidden" name="category" value={categoryValue} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch">Batch number</Label>
                <Input id="batch" name="batch" placeholder="AMX2406" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty">Stock quantity</Label>
                <Input id="qty" name="qty" type="number" min={0} placeholder="500" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mfgdate">Manufacturing date</Label>
                <Input id="mfgdate" name="mfgdate" type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp">Expiry date</Label>
                <Input id="exp" name="exp" type="date" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pricing & tax</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mrp">MRP (₹)</Label>
                <Input id="mrp" name="mrp" type="number" min={0} step="0.01" placeholder="120" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Wholesale price (₹)</Label>
                <Input id="price" name="price" type="number" min={0} step="0.01" placeholder="96" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hsn">HSN code</Label>
                <Input id="hsn" name="hsn" placeholder="30041020" required />
              </div>
              <div className="space-y-1.5">
                <Label>GST percentage</Label>
                <Select value={gstValue} onValueChange={setGstValue}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 5, 12, 18, 28].map((g) => <SelectItem key={g} value={String(g)}>{g}%</SelectItem>)}
                  </SelectContent>
                </Select>
                <input type="hidden" name="gst" value={gstValue} />
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            {success ? <p className="mb-3 text-sm text-success">{success}</p> : null}
            <div className="flex justify-end gap-2">
              <Button asChild variant="outline"><Link to="/distributor/products">Cancel</Link></Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save product"}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
