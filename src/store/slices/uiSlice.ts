import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  theme: "light" | "dark";
  productFilters: Record<string, string>;
  orderFilters: Record<string, string>;
}

const initialState: UiState = {
  theme: "light",
  productFilters: {},
  orderFilters: {},
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.theme = action.payload;
    },
    setProductFilters(state, action: PayloadAction<Record<string, string>>) {
      state.productFilters = action.payload;
    },
    setOrderFilters(state, action: PayloadAction<Record<string, string>>) {
      state.orderFilters = action.payload;
    },
  },
});

export const { setTheme, setProductFilters, setOrderFilters } = uiSlice.actions;
export default uiSlice.reducer;
