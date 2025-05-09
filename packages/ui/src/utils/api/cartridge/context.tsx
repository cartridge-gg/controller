import { createContext, ReactNode } from "react";

type CartridgeAPIContextType = {
  url: string;
  credentials?: RequestInit["credentials"];
  headers?: RequestInit["headers"];
};

const initialState: CartridgeAPIContextType = {
  url: "",
};

export const CartridgeAPIContext =
  createContext<CartridgeAPIContextType>(initialState);

export function CartridgeAPIProvider({
  url,
  credentials,
  headers,
  children,
}: {
  url: string;
  credentials?: RequestInit["credentials"];
  headers?: RequestInit["headers"];
  children: ReactNode;
}) {
  return (
    <CartridgeAPIContext.Provider
      value={{ ...initialState, headers, credentials, url }}
    >
      {children}
    </CartridgeAPIContext.Provider>
  );
}
