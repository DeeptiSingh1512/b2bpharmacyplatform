import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/types";

interface ProductState {
  selectedProduct: Product | null;
  items: Product[];
}

const initialState: ProductState = {
  selectedProduct: null,
  items: [],
};

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload;
    },
  },
});

export const { setProducts, setSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
