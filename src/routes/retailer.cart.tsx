import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products, inr } from "@/lib/mock-data";
import { Minus, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/retailer/cart")({
  head: () => ({ meta: [{ title: "Cart — Retailer" }] }),
  component: CartPage,
});

function CartPage() {
  const [items, setItems] = useState(
    products.slice(0, 4).map((p, i) => ({ ...p, qty: [40, 24, 10, 6][i] })),
  );
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const gst = items.reduce((a, i) => a + (i.price * i.qty * i.gst) / 100, 0);
  const total = subtotal + gst;

  const update = (id: string, delta: number) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i));

  return (
    <>
      <Topbar title="Cart" subtitle={`${items.length} items · bulk order ready`} />
      <main className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Items</CardTitle>
              <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-1.5" /> Upload bulk CSV</Button>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {items.map((i) => (
                <div key={i.id} className="py-4 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {i.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.manufacturer} · Batch {i.batch} · GST {i.gst}%</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => update(i.id, -1)}><Minus className="h-3 w-3" /></Button>
                    <Input value={i.qty} readOnly className="w-14 h-8 text-center" />
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => update(i.id, 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <div className="w-24 text-right tabular-nums font-medium">{inr(i.price * i.qty)}</div>
                  <Button size="icon" variant="ghost" onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader><CardTitle className="text-base">Order summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Subtotal" value={inr(subtotal)} />
            <Row label="GST" value={inr(gst)} />
            <Row label="Delivery" value="Free" />
            <div className="h-px bg-border my-2" />
            <Row label="Total" value={inr(total)} bold />

            <div className="rounded-lg bg-info/10 text-info text-xs p-3">
              You have ₹57,500 of available credit. Order will be placed on credit.
            </div>
            <Button asChild className="w-full" size="lg"><Link to="/retailer/orders">Place bulk order</Link></Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "font-semibold text-base" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}
