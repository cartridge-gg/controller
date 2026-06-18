import { useContext } from "react";
import { StarterpackContext } from "./starterpack-context";

export const useStarterpackContext = () => {
  const context = useContext(StarterpackContext);
  if (!context) {
    throw new Error(
      "useStarterpackContext must be used within StarterpackProvider",
    );
  }
  return context;
};
