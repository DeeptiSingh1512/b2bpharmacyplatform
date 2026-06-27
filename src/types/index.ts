export interface Product {
  id: string | number;
  productID?: string | number;
  productName?: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  manufacturer?: string;
  category?: string;
  batch?: string;
  batchNumber?: string;
  company?: string;
  mfgDate?: string;
  expiryDate?: string;
  manufacturingDate?: string;
  hsn?: string;
  hsnCode?: string;
  gst?: number;
  gst_percent?: number;
  stock?: number;
  mrp?: number;
  price?: number;
  imageUrl?: string;
  availability?: string;
  status?: string;
}

export interface Order {
  id: string | number;
  orderId?: string | number;
  retailer?: string;
  retailer_id?: string | number;
  retailerId?: string | number;
  date?: string;
  createdAt?: string;
  items?: number | Product[];
  amount?: number;
  status?: string;
  payment?: string;
  payment_method?: string;
  products?: Product[];
}

export interface User {
  id: string | number;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  token?: string;
  status?: string;
}

export interface Payment {
  id?: string | number;
  order_id?: string | number;
  orderId?: string | number;
  retailer_id?: string | number;
  retailer?: string;
  retailerName?: string;
  amount?: number;
  method?: string;
  status?: string;
  date?: string;
  order_date?: string;
  createdAt?: string;
}

export interface Notification {
  id: string | number;
  title?: string;
  body?: string;
  time?: string;
  type?: string;
  read?: boolean;
}

export interface Credit {
  id?: string | number;
  retailer_id?: string | number;
  retailerId?: string | number;
  credit_limit?: number;
  creditLimit?: number;
  credit_used?: number;
  creditUsed?: number;
  amount?: number;
  status?: string;
}

export interface Return {
  id: string | number;
  order_id?: string | number;
  orderId?: string | number;
  retailer?: string;
  product?: string;
  reason?: string;
  amount?: number;
  refund_method?: string;
  status?: string;
  date?: string;
}
