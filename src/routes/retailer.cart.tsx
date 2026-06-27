import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/api/orders";
import { getCredit } from "@/api/credit";
import { inr } from "@/lib/api-adapters";
import { getUser } from "@/lib/auth";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/retailer/cart")({
  head: () => ({ meta: [{ title: "Cart — Retailer" }] }),
  component: CartPage,
});

function CartPage() {
  const { items: cartItems, updateQty, removeFromCart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creditRemaining, setCreditRemaining] = useState<number | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    getCredit(user.id)
      .then((data: { remaining?: number }) => setCreditRemaining(Number(data.remaining ?? 0)))
      .catch(() => setCreditRemaining(null));
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price ?? 0) * item.qty, 0);
  const gst = cartItems.reduce(
    (sum, item) => sum + (Number(item.price ?? 0) * item.qty * Number(item.gst ?? 12)) / 100,
    0,
  );
  const total = subtotal + gst;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError("Add at least one product to the cart before placing an order.");
      return;
    }

    if (paymentMethod === "credit" && creditRemaining !== null && total > creditRemaining) {
      setError(`Order total exceeds available credit (${inr(creditRemaining)} remaining).`);
      return;
    }

    setIsPlacing(true);
    setError(null);
    setSuccess(null);

    try {
      await createOrder(
        cartItems.map((item) => ({ product_id: Number(item.id), quantity: item.qty })),
        paymentMethod,
      );
      clearCart();
      setSuccess("Order placed successfully.");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Unable to place order. Please try again.";
      setError(message);
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
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {cartItems.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Your cart is empty. Browse products to add items.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {(item.productName || item.name || "?").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{item.productName || item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Batch {item.batchNumber || item.batch || "N/A"} · GST {item.gst ?? 12}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-24 text-right tabular-nums font-medium">{inr(Number(item.price ?? 0) * item.qty)}</div>
                    <Button size="icon" variant="ghost" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
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
            {creditRemaining !== null ? (
              <Row label="Credit available" value={inr(creditRemaining)} />
            ) : null}
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
            {error ? (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{error}</div>
            ) : null}

            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isPlacing || cartItems.length === 0}>
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
