import { DataContext } from "@/context/data";
import { useContext } from "react";

export function useData() {
  return useContext(DataContext);
}
