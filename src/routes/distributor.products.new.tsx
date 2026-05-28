import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import type { FormEvent } from "react";

export const Route = createFileRoute("/distributor/products/new")({
  head: () => ({ meta: [{ title: "Add product — Distributor" }] }),
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => { e.preventDefault(); navigate({ to: "/distributor/products" }); };

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
                <Input id="name" placeholder="Amoxicillin 500mg Capsule" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mfg">Manufacturer</Label>
                <Input id="mfg" placeholder="Cipla" required />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select defaultValue="Antibiotics">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch">Batch number</Label>
                <Input id="batch" placeholder="AMX2406" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty">Stock quantity</Label>
                <Input id="qty" type="number" min={0} placeholder="500" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mfgdate">Manufacturing date</Label>
                <Input id="mfgdate" type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp">Expiry date</Label>
                <Input id="exp" type="date" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pricing & tax</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mrp">MRP (₹)</Label>
                <Input id="mrp" type="number" min={0} step="0.01" placeholder="120" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Wholesale price (₹)</Label>
                <Input id="price" type="number" min={0} step="0.01" placeholder="96" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hsn">HSN code</Label>
                <Input id="hsn" placeholder="30041020" required />
              </div>
              <div className="space-y-1.5">
                <Label>GST percentage</Label>
                <Select defaultValue="12">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 5, 12, 18, 28].map((g) => <SelectItem key={g} value={String(g)}>{g}%</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 flex justify-end gap-2">
            <Button asChild variant="outline"><Link to="/distributor/products">Cancel</Link></Button>
            <Button type="submit">Save product</Button>
          </div>
        </form>
      </main>
    </>
  );
}
