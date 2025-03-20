import { createContext, ReactNode } from "react";

export interface StarterItemData {
  title: string;
  description: string;
  price: number;
  image: string;
}

export interface StarterPackContextType {
  starterPackItems: StarterItemData[];
}

export const StarterPackContext = createContext<
  StarterPackContextType | undefined
>(undefined);

interface StarterPackProviderProps {
  children: ReactNode;
}

export function StarterPackProvider({ children }: StarterPackProviderProps) {
  const StarterPackItems: StarterItemData[] = [
    {
      title: "Village",
      description:
        "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
      price: 5,
      image: "https://r2.quddus.my/Frame%203231.png",
    },
    {
      title: "20 Credits",
      description: "Credits cover service fee(s) in Eternum.",
      price: 0,
      image: "/ERC-20-Icon.svg",
    },
  ];

  return (
    <StarterPackContext.Provider value={{ starterPackItems: StarterPackItems }}>
      {children}
    </StarterPackContext.Provider>
  );
}
