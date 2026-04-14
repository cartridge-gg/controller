import { createContext, useContext } from "react";

export type BottomLayout = "none" | "tabs" | "footer";

const initialState = {
  withBackground: false,
  setWithBackground: () => {},
  bottomLayout: "none" as BottomLayout,
  setBottomLayout: () => {},
};

type LayoutContextType = {
  withBackground: boolean;
  setWithBackground: (withBackground: boolean) => void;
  bottomLayout: BottomLayout;
  setBottomLayout: (bottomLayout: BottomLayout) => void;
};

export const LayoutContext = createContext<LayoutContextType>(initialState);

export function useLayoutContext() {
  return useContext(LayoutContext);
}
