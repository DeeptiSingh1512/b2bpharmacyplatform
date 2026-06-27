import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Order, Product } from "@/types";

export interface ApiError {
  status: number | string;
  message: string;
  data?: unknown;
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    const error = result.error as FetchBaseQueryError;
    const messageFromData =
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof (error.data as Record<string, unknown>).message === "string"
        ? (error.data as Record<string, unknown>).message
        : typeof error.data === "string"
          ? error.data
          : undefined;
    const message =
      messageFromData ||
      (typeof error.status === "number"
        ? `Request failed with status ${error.status}`
        : "An unexpected API error occurred.");
    return {
      ...result,
      error: { status: error.status, message, data: error.data } as ApiError,
    };
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Product", "Order", "Payment", "Notification", "Credit", "Return", "User"],
  endpoints: (build) => ({
    login: build.mutation<
      { token: string; user?: Record<string, unknown> },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: build.mutation<
      Record<string, unknown>,
      { fullName: string; email: string; password: string; phone: string }
    >({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
    }),
    getAllProducts: build.query<Product[], Record<string, string> | void>({
      query: (params) => ({ url: "/products", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),
    getProductById: build.query<Product, string | number>({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Product" as const, id }],
    }),
    createProduct: build.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Product" as const, id: "LIST" }],
    }),
    updateProduct: build.mutation<
      Product,
      { id: string | number; body: Partial<Product> }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product" as const, id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
    deleteProduct: build.mutation<{ success: boolean }, string | number>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Product" as const, id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
    importProducts: build.mutation<
      { imported: number; failed: Array<{ row: number; message: string }> },
      { products: Array<Partial<Product>> }
    >({
      query: (payload) => ({
        url: "/products/import",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Product" as const, id: "LIST" }],
    }),
    getOrders: build.query<Order[], Record<string, string> | void>({
      query: (params) => ({ url: "/orders", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Order" as const, id })),
              { type: "Order" as const, id: "LIST" },
            ]
          : [{ type: "Order" as const, id: "LIST" }],
    }),
    getOrderById: build.query<Order, string | number>({
      query: (id) => ({ url: `/orders/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Order" as const, id }],
    }),
    updateOrderStatus: build.mutation<
      Order,
      { id: string | number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order" as const, id },
        { type: "Order" as const, id: "LIST" },
      ],
    }),
    createOrder: build.mutation<
      Order,
      { items: Array<{ product_id: number; quantity: number }>; payment_method: string }
    >({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: [{ type: "Order" as const, id: "LIST" }],
    }),
    getInvoice: build.query<unknown, string | number>({
      query: (id) => ({ url: `/invoices/${id}` }),
    }),
    getPayments: build.query<unknown[], Record<string, string> | void>({
      query: (params) => ({ url: "/payments", params: params ?? undefined }),
      providesTags: [{ type: "Payment" as const, id: "LIST" }],
    }),
    createPayment: build.mutation<
      unknown,
      { order_id: string | number; amount: number; method: string }
    >({
      query: (body) => ({ url: "/payments", method: "POST", body }),
      invalidatesTags: [{ type: "Payment" as const, id: "LIST" }],
    }),
    getNotifications: build.query<unknown[], void>({
      query: () => "/notifications",
      providesTags: [{ type: "Notification" as const, id: "LIST" }],
    }),
    markNotificationAsRead: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PUT" }),
      invalidatesTags: [{ type: "Notification" as const, id: "LIST" }],
    }),
    getUsers: build.query<unknown[], void>({
      query: () => ({ url: "/auth/users" }),
      providesTags: [{ type: "User" as const, id: "LIST" }],
    }),
    getCredit: build.query<unknown, string | number>({
      query: (retailerId) => ({ url: `/credit/${retailerId}` }),
      providesTags: [{ type: "Credit" as const, id: "LIST" }],
    }),
    setCredit: build.mutation<
      unknown,
      { retailer_id: string | number; credit_limit: number }
    >({
      query: (body) => ({ url: "/credit", method: "POST", body }),
      invalidatesTags: [{ type: "Credit" as const, id: "LIST" }],
    }),
    requestCredit: build.mutation<unknown, { amount: number; note?: string }>({
      query: (body) => ({ url: "/credit/request", method: "POST", body }),
      invalidatesTags: [{ type: "Credit" as const, id: "LIST" }],
    }),
    getReturns: build.query<unknown[], void>({
      query: () => ({ url: "/returns" }),
      providesTags: [{ type: "Return" as const, id: "LIST" }],
    }),
    createReturn: build.mutation<
      unknown,
      { order_id: string | number; reason: string; refund_method: string }
    >({
      query: (body) => ({ url: "/returns", method: "POST", body }),
      invalidatesTags: [{ type: "Return" as const, id: "LIST" }],
    }),
    updateReturnStatus: build.mutation<
      unknown,
      { id: string | number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/returns/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Return" as const, id },
        { type: "Return" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useImportProductsMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetInvoiceQuery,
  useLazyGetInvoiceQuery,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGetUsersQuery,
  useGetCreditQuery,
  useSetCreditMutation,
  useRequestCreditMutation,
  useGetReturnsQuery,
  useCreateReturnMutation,
  useUpdateReturnStatusMutation,
} = api;
