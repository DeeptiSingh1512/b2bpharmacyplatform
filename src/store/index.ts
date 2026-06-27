import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api/api";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    products: productReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
