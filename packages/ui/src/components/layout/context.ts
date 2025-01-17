import { createContext, useContext } from "react";

const initialState = {
  withFooter: false,
  setWithFooter: () => {},
};

type LayoutContextType = {
  withFooter: boolean;
  setWithFooter: (withFooter: boolean) => void;
};

export const LayoutContext = createContext<LayoutContextType>(initialState);

export function useLayoutContext() {
  return useContext(LayoutContext);
}
