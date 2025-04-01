import { useContext } from "react";
import {
  StarterPackContext,
  StarterPackContextType,
} from "../context/starterpack";

export function useStarterPack(): StarterPackContextType {
  const context = useContext(StarterPackContext);
  if (context === undefined) {
    throw new Error("useStarterPack must be used within a StarterPackProvider");
  }
  return context;
}
