import { createContext, ReactNode } from "react";

type CartridgeAPIContextType = {
  url: string;
  headers?: RequestInit["headers"],
  credentials?: RequestInit["credentials"],
};

const initialState: CartridgeAPIContextType = {
  url: "",
};

export const CartridgeAPIContext = createContext<CartridgeAPIContextType>(initialState);

export function CartridgeAPIProvider({ url, headers, children }: { url: string, headers?: RequestInit["headers"], children: ReactNode }) {
  return (
    <CartridgeAPIContext.Provider value={{ ...initialState, headers, url }}>{children}</CartridgeAPIContext.Provider>
  );
}
