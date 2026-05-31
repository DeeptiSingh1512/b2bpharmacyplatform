import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllProducts } from "@/api/products";
import { createOrder } from "@/api/orders";
import { inr } from "@/lib/mock-data";
import { Minus, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/retailer/cart")({
  head: () => ({ meta: [{ title: "Cart — Retailer" }] }),
  component: CartPage,
});

function CartPage() {
  const [products, setProducts] = useState<Array<any>>([]);
  const [cartItems, setCartItems] = useState<Array<any>>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllProducts();
        setProducts(data || []);
      } catch (err: unknown) {
        setError("Unable to load products. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSuccess(null);
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item,
        )
        .filter((item) => item.qty > 0),
    );
    setSuccess(null);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSuccess(null);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = cartItems.reduce((sum, item) => sum + (item.price * item.qty * item.gst) / 100, 0);
  const total = subtotal + gst;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError("Add at least one product to the cart before placing an order.");
      return;
    }
    setIsPlacing(true);
    setError(null);
    setSuccess(null);

    try {
      await createOrder(
        cartItems.map((item) => ({ product_id: item.id, quantity: item.qty })),
        paymentMethod,
      );
      setCartItems([]);
      setSuccess("Order placed successfully.");
    } catch (err: unknown) {
      setError("Unable to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <>
      <Topbar title="Cart" subtitle={`${cartItems.length} items · bulk order ready`} />
      <main className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Items</CardTitle>
              <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-1.5" /> Upload bulk CSV</Button>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Loading products…</div>
              ) : error ? (
                <div className="py-6 text-center text-sm text-destructive">{error}</div>
              ) : products.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No products available.</div>
              ) : (
                products.map((product) => {
                  const cartItem = cartItems.find((item) => item.id === product.id);
                  return (
                    <div key={product.id} className="py-4 flex items-center gap-3">
                      <div className="h-11 w-11 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {(product.productName || product.name || '?').charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{product.productName || product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.company || product.category} · Batch {product.batchNumber || 'N/A'} · GST {product.gst_percent || 0}%
                        </div>
                      </div>
                      <div className="w-24 text-right tabular-nums font-medium">{inr(product.price)}</div>
                      <Button size="sm" variant="outline" onClick={() => addToCart(product)}>
                        Add to cart{cartItem ? ` (${cartItem.qty})` : ""}
                      </Button>
                    </div>
                  );
                })
              )}
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

            <div>
              <label className="block text-sm font-medium mb-1">Payment method</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as "cash" | "credit")}
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            {success ? (
              <div className="rounded-lg bg-emerald-50 text-emerald-700 text-sm p-3">{success}</div>
            ) : null}
            {error && !isLoading ? (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{error}</div>
            ) : null}

            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isPlacing || cartItems.length === 0 || isLoading}>
              {isPlacing ? "Placing order…" : "Place order"}
            </Button>
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
