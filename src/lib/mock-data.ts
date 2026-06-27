export type OrderStatus =
  | "Pending"
  | "Approved"
  | "Packed"
  | "Dispatched"
  | "Delivered";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Approved",
  "Packed",
  "Dispatched",
  "Delivered",
];

export type Product = {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  batch: string;
  mfgDate: string;
  expiryDate: string;
  hsn: string;
  gst: number;
  stock: number;
  mrp: number;
  price: number;
};

export const categories = [
  "Antibiotics",
  "Analgesics",
  "Cardiac",
  "Diabetes",
  "Dermatology",
  "Vitamins",
  "Respiratory",
];

export const products: Product[] = [
  { id: "P-1001", name: "Amoxicillin 500mg", manufacturer: "Cipla", category: "Antibiotics", batch: "AMX2401", mfgDate: "2024-03-12", expiryDate: "2026-03-11", hsn: "30041020", gst: 12, stock: 1240, mrp: 120, price: 96 },
  { id: "P-1002", name: "Paracetamol 650mg", manufacturer: "Sun Pharma", category: "Analgesics", batch: "PCM2407", mfgDate: "2024-07-02", expiryDate: "2027-06-30", hsn: "30049099", gst: 12, stock: 5400, mrp: 35, price: 22 },
  { id: "P-1003", name: "Atorvastatin 20mg", manufacturer: "Dr. Reddy's", category: "Cardiac", batch: "ATR2312", mfgDate: "2023-12-18", expiryDate: "2025-12-17", hsn: "30049051", gst: 12, stock: 38, mrp: 180, price: 132 },
  { id: "P-1004", name: "Metformin 500mg", manufacturer: "Lupin", category: "Diabetes", batch: "MTF2402", mfgDate: "2024-02-09", expiryDate: "2026-02-08", hsn: "30049079", gst: 12, stock: 820, mrp: 60, price: 41 },
  { id: "P-1005", name: "Cetirizine 10mg", manufacturer: "Mankind", category: "Respiratory", batch: "CTZ2406", mfgDate: "2024-06-15", expiryDate: "2025-08-30", hsn: "30049039", gst: 12, stock: 12, mrp: 45, price: 28 },
  { id: "P-1006", name: "Vitamin D3 60K", manufacturer: "Abbott", category: "Vitamins", batch: "VTD2405", mfgDate: "2024-05-22", expiryDate: "2026-05-21", hsn: "30045010", gst: 5, stock: 670, mrp: 90, price: 64 },
  { id: "P-1007", name: "Azithromycin 500mg", manufacturer: "Zydus", category: "Antibiotics", batch: "AZT2403", mfgDate: "2024-03-30", expiryDate: "2025-07-15", hsn: "30042039", gst: 12, stock: 95, mrp: 150, price: 110 },
  { id: "P-1008", name: "Clobetasol Cream", manufacturer: "GSK", category: "Dermatology", batch: "CLB2401", mfgDate: "2024-01-10", expiryDate: "2026-01-09", hsn: "30049019", gst: 12, stock: 240, mrp: 75, price: 52 },
];

export type Retailer = {
  id: string;
  name: string;
  owner: string;
  city: string;
  status: "Pending" | "Approved" | "Rejected";
  creditLimit: number;
  creditUsed: number;
  joined: string;
};

export const retailers: Retailer[] = [
  { id: "R-2001", name: "MediPlus Pharmacy", owner: "Rohit Sharma", city: "Mumbai", status: "Approved", creditLimit: 200000, creditUsed: 142500, joined: "2024-02-11" },
  { id: "R-2002", name: "Wellness Chemist", owner: "Anita Desai", city: "Pune", status: "Approved", creditLimit: 150000, creditUsed: 38000, joined: "2024-04-03" },
  { id: "R-2003", name: "CareWell Drugs", owner: "Vikram Singh", city: "Delhi", status: "Pending", creditLimit: 0, creditUsed: 0, joined: "2026-05-21" },
  { id: "R-2004", name: "City Medicos", owner: "Priya Nair", city: "Bengaluru", status: "Approved", creditLimit: 300000, creditUsed: 268900, joined: "2023-11-20" },
  { id: "R-2005", name: "Apollo Local", owner: "Sunil Kumar", city: "Hyderabad", status: "Pending", creditLimit: 0, creditUsed: 0, joined: "2026-05-25" },
];

export type Order = {
  id: string;
  retailer: string;
  date: string;
  items: number;
  amount: number;
  status: OrderStatus;
  payment: "Paid" | "Pending" | "Overdue" | "Credit";
};

export const orders: Order[] = [
  { id: "ORD-9012", retailer: "MediPlus Pharmacy", date: "2026-05-26", items: 14, amount: 28450, status: "Out for delivery", payment: "Credit" },
  { id: "ORD-9011", retailer: "City Medicos", date: "2026-05-26", items: 8, amount: 12800, status: "Pending", payment: "Pending" },
  { id: "ORD-9010", retailer: "Wellness Chemist", date: "2026-05-25", items: 22, amount: 51200, status: "Dispatched", payment: "Paid" },
  { id: "ORD-9009", retailer: "MediPlus Pharmacy", date: "2026-05-24", items: 6, amount: 7400, status: "Delivered", payment: "Paid" },
  { id: "ORD-9008", retailer: "CareWell Drugs", date: "2026-05-24", items: 11, amount: 19850, status: "Approved", payment: "Credit" },
  { id: "ORD-9007", retailer: "City Medicos", date: "2026-05-23", items: 19, amount: 42300, status: "Packed", payment: "Overdue" },
  { id: "ORD-9006", retailer: "Wellness Chemist", date: "2026-05-22", items: 4, amount: 5600, status: "Delivered", payment: "Paid" },
];

export const revenueSeries = [
  { month: "Dec", revenue: 410000, orders: 142 },
  { month: "Jan", revenue: 482000, orders: 168 },
  { month: "Feb", revenue: 521000, orders: 191 },
  { month: "Mar", revenue: 498000, orders: 184 },
  { month: "Apr", revenue: 612000, orders: 224 },
  { month: "May", revenue: 689500, orders: 251 },
];

export const categoryShare = [
  { name: "Antibiotics", value: 32 },
  { name: "Cardiac", value: 21 },
  { name: "Diabetes", value: 18 },
  { name: "Analgesics", value: 14 },
  { name: "Other", value: 15 },
];

export type Return = {
  id: string;
  order: string;
  retailer: string;
  product: string;
  reason: string;
  amount: number;
  status: "Requested" | "Approved" | "Rejected" | "Refunded";
  date: string;
};

export const returns: Return[] = [
  { id: "RT-501", order: "ORD-9006", retailer: "Wellness Chemist", product: "Cetirizine 10mg", reason: "Near expiry", amount: 1240, status: "Approved", date: "2026-05-24" },
  { id: "RT-502", order: "ORD-9009", retailer: "MediPlus Pharmacy", product: "Atorvastatin 20mg", reason: "Damaged packaging", amount: 2640, status: "Requested", date: "2026-05-25" },
  { id: "RT-503", order: "ORD-9007", retailer: "City Medicos", product: "Azithromycin 500mg", reason: "Wrong batch", amount: 4400, status: "Refunded", date: "2026-05-26" },
];

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "order" | "payment" | "stock" | "system";
};

export const notifications: Notification[] = [
  { id: "n1", title: "Order ORD-9012 shipped", body: "Out for delivery, ETA tomorrow 11 AM.", time: "2h ago", type: "order" },
  { id: "n2", title: "Invoice INV-3308 due in 3 days", body: "Amount ₹42,300 — pay to avoid late fees.", time: "5h ago", type: "payment" },
  { id: "n3", title: "Low stock: Cetirizine 10mg", body: "Only 12 units remaining at distributor.", time: "1d ago", type: "stock" },
  { id: "n4", title: "New price list available", body: "May 2026 catalog has been published.", time: "2d ago", type: "system" },
];

export function daysUntil(date: string) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.round(ms / 86400000);
}

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
