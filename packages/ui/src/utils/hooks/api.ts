import { useContext } from "react";
import { CartridgeAPIContext } from "../api/cartridge";
import { IndexerAPIContext } from "../api/indexer/context";

export function useCartridgeAPI() {
  return useContext(CartridgeAPIContext);
}

export function useIndexerAPI() {
  return useContext(IndexerAPIContext);
}
