/**
 * useProducts — custom hook encapsulating product RTK Query calls.
 * Abstracts away RTK hook details from page components.
 */
import { useState, useCallback } from "react";
import {
  useGetAllProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useImportProductsMutation,
} from "@/store/api/api";
import { normalizeProduct } from "@/lib/api-adapters";
import type { Product } from "@/types";

export interface UseProductsOptions {
  filters?: Record<string, string>;
}

export function useProducts({ filters = {} }: UseProductsOptions = {}) {
  const { data: rawProducts = [], isLoading, error, refetch } = useGetAllProductsQuery(filters);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [importProducts, { isLoading: isImporting }] = useImportProductsMutation();

  const [importResult, setImportResult] = useState<{ imported: number; failed: { row: number; message: string }[] } | null>(null);

  const products = rawProducts.map(normalizeProduct);

  const handleCreate = useCallback(
    async (data: Partial<Product>) => {
      return createProduct(data).unwrap();
    },
    [createProduct]
  );

  const handleUpdate = useCallback(
    async (id: string | number, data: Partial<Product>) => {
      return updateProduct({ id, body: data }).unwrap();
    },
    [updateProduct]
  );

  const handleDelete = useCallback(
    async (id: string | number) => {
      return deleteProduct(id).unwrap();
    },
    [deleteProduct]
  );

  const handleImport = useCallback(
    async (parsedProducts: Partial<Product>[]) => {
      const result = await importProducts({ products: parsedProducts }).unwrap();
      setImportResult(result);
      return result;
    },
    [importProducts]
  );

  return {
    products,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isImporting,
    error,
    importResult,
    refetch,
    createProduct: handleCreate,
    updateProduct: handleUpdate,
    deleteProduct: handleDelete,
    importProducts: handleImport,
  };
}
