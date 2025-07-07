import { DataContext } from "#profile/context/data";
import { useContext } from "react";

export function useData() {
  return useContext(DataContext);
}
