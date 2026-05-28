import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/mock-data";

const map: Record<OrderStatus, string> = {
  Pending: "bg-muted text-muted-foreground",
  Approved: "bg-info/15 text-info",
  Packed: "bg-accent text-accent-foreground",
  Dispatched: "bg-primary/15 text-primary",
  "Out for delivery": "bg-warning/25 text-warning-foreground",
  Delivered: "bg-success/15 text-success",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", map[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function PaymentBadge({ status }: { status: "Paid" | "Pending" | "Overdue" | "Credit" }) {
  const styles = {
    Paid: "bg-success/15 text-success",
    Pending: "bg-muted text-muted-foreground",
    Overdue: "bg-destructive/10 text-destructive",
    Credit: "bg-info/15 text-info",
  } as const;
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
}

export function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) {
    return <span className="rounded-md bg-destructive/10 text-destructive px-2 py-0.5 text-[11px] font-medium">Expired</span>;
  }
  if (days <= 90) {
    return <span className="rounded-md bg-destructive/10 text-destructive px-2 py-0.5 text-[11px] font-medium">Expires in {days}d</span>;
  }
  if (days <= 180) {
    return <span className="rounded-md bg-warning/25 text-warning-foreground px-2 py-0.5 text-[11px] font-medium">Near expiry · {Math.round(days/30)}mo</span>;
  }
  return <span className="rounded-md bg-success/15 text-success px-2 py-0.5 text-[11px] font-medium">Fresh</span>;
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 50) return <span className="rounded-md bg-destructive/10 text-destructive px-2 py-0.5 text-[11px] font-medium">Low · {stock}</span>;
  if (stock <= 200) return <span className="rounded-md bg-warning/25 text-warning-foreground px-2 py-0.5 text-[11px] font-medium">Limited · {stock}</span>;
  return <span className="rounded-md bg-muted text-muted-foreground px-2 py-0.5 text-[11px] font-medium">In stock · {stock}</span>;
}

export function FifoTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
      FIFO
    </span>
  );
}
