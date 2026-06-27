import type { Notification, Order, Product, Return, User } from "@/types";

export function normalizeProduct(raw: Record<string, unknown>): Product {
  const id = raw.id as string | number;
  const productName = String(raw.productName ?? raw.name ?? "");
  const description = String(raw.description ?? raw.manufacturer ?? "");
  return {
    id,
    productName,
    name: productName,
    description,
    manufacturer: description,
    category: String(raw.category ?? ""),
    batch: String(raw.batchNumber ?? raw.batch ?? ""),
    batchNumber: String(raw.batchNumber ?? raw.batch ?? ""),
    mfgDate: String(raw.manufacturingDate ?? raw.mfgDate ?? ""),
    manufacturingDate: String(raw.manufacturingDate ?? raw.mfgDate ?? ""),
    expiryDate: String(raw.expiryDate ?? ""),
    hsn: String(raw.hsnCode ?? raw.hsn ?? ""),
    hsnCode: String(raw.hsnCode ?? raw.hsn ?? ""),
    gst: Number(raw.gst ?? raw.gst_percent ?? 12),
    gst_percent: Number(raw.gst ?? raw.gst_percent ?? 12),
    stock: Number(raw.stock ?? 0),
    mrp: Number(raw.mrp ?? raw.price ?? 0),
    price: Number(raw.price ?? 0),
    imageUrl: raw.imageUrl as string | undefined,
  };
}

export function normalizeOrder(raw: Record<string, unknown>): Order {
  const id = raw.id as string | number;
  return {
    id,
    orderId: id,
    retailer: String(raw.retailerName ?? raw.retailer ?? ""),
    retailer_id: raw.userId as string | number | undefined,
    retailerId: raw.userId as string | number | undefined,
    date: String(raw.orderDate ?? raw.date ?? raw.createdAt ?? ""),
    createdAt: String(raw.createdAt ?? raw.orderDate ?? ""),
    amount: Number(raw.totalPrice ?? raw.amount ?? 0),
    status: String(raw.status ?? "Pending"),
    payment: String(raw.payment_method ?? raw.payment ?? "Pending"),
    payment_method: String(raw.payment_method ?? raw.payment ?? "Pending"),
    items: raw.itemCount as number | undefined,
  };
}

export function normalizeNotification(raw: Record<string, unknown>): Notification {
  const sentAt = raw.sent_at ?? raw.time;
  const message = String(raw.message ?? raw.body ?? "");
  return {
    id: raw.id as string | number,
    title: String(raw.title ?? raw.type ?? "Notification"),
    body: message,
    time: sentAt ? new Date(String(sentAt)).toLocaleString("en-IN") : "",
    type: String(raw.type ?? "system"),
    read: Boolean(raw.is_read ?? raw.read ?? false),
  };
}

export function normalizeReturn(raw: Record<string, unknown>): Return {
  return {
    id: raw.id as string | number,
    order_id: raw.orderId as string | number | undefined,
    orderId: raw.orderId as string | number | undefined,
    order: String(raw.orderId ?? raw.order ?? ""),
    retailer: String(raw.retailerName ?? raw.retailer ?? ""),
    product: String(raw.product ?? raw.productName ?? "-"),
    reason: String(raw.reason ?? ""),
    amount: Number(raw.refundAmount ?? raw.amount ?? 0),
    refund_method: String(raw.refund_method ?? raw.refundMethod ?? ""),
    status: mapReturnStatus(String(raw.status ?? "Pending")),
    date: String(raw.createdAt ?? raw.date ?? ""),
  };
}

function mapReturnStatus(status: string): string {
  if (status === "Pending") return "Requested";
  return status;
}

export function toBackendReturnStatus(status: string): string {
  if (status === "Requested") return "Pending";
  return status;
}

export function normalizeRetailer(raw: Record<string, unknown>): User & {
  isApproved: boolean;
  creditLimit: number;
  creditUsed: number;
  joined: string;
} {
  const isApproved = raw.isApproved === true || raw.isApproved === 1;
  return {
    id: raw.id as string | number,
    name: String(raw.name ?? raw.fullName ?? ""),
    fullName: String(raw.fullName ?? raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    role: String(raw.role ?? "retailer"),
    status: isApproved ? "Approved" : "Pending",
    isApproved,
    creditLimit: Number(raw.credit_limit ?? raw.creditLimit ?? 0),
    creditUsed: Number(raw.used_credit ?? raw.creditUsed ?? 0),
    joined: String(raw.createdAt ?? ""),
  };
}

export function daysUntil(dateStr: string | undefined): number {
  if (!dateStr) return 999;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return 999;
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function inr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
