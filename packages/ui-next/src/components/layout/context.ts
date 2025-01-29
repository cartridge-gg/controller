import { createContext, useContext } from "react";

const initialState = {
  withBottomTabs: false,
  setWithBottomTabs: () => {},
  withFooter: false,
  setWithFooter: () => {},
};

type LayoutContextType = {
  withBottomTabs: boolean;
  setWithBottomTabs: (withBottomTabs: boolean) => void;
  withFooter: boolean;
  setWithFooter: (withFooter: boolean) => void;
};

export const LayoutContext = createContext<LayoutContextType>(initialState);

export function useLayoutContext() {
  return useContext(LayoutContext);
}
