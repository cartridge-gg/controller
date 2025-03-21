import { createContext, PropsWithChildren } from "react";

export interface StarterItemData {
  title: string;
  description: string;
  price: number;
  image: string;
}

export interface StarterPackContextType {
  balance: number;
  starterPackItems: StarterItemData[];
}

export const StarterPackContext = createContext<
  StarterPackContextType | undefined
>(undefined);

export function StarterPackProvider({
  children,
  balance,
  starterPackItems,
}: PropsWithChildren<StarterPackContextType>) {
  return (
    <StarterPackContext.Provider
      value={{ balance: balance, starterPackItems: starterPackItems }}
    >
      {children}
    </StarterPackContext.Provider>
  );
}
