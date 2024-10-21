import { useContext } from "react";
import { CartridgeAPIContext } from "../api/cartridge";

export function useCartridgeAPI() {
  return useContext(CartridgeAPIContext);
}
