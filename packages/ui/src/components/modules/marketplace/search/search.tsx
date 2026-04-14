import {
  MarketplaceSearchCard,
  MarketplaceSearchResult,
  MarketplaceSearchResults,
  MarketplaceSearchEngine,
} from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes, useCallback, useMemo } from "react";

const marketplaceSearchVariants = cva("flex flex-col gap-0.5", {
  variants: {
    variant: {
      darkest: "",
      darker: "",
      dark: "",
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface SearchResult {
  image: React.ReactNode;
  label: string;
}

export interface MarketplaceSearchProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceSearchVariants> {
  search: string;
  setSearch: (search: string) => void;
  selected?: SearchResult;
  setSelected?: (result: SearchResult | undefined) => void;
  options: SearchResult[];
}

export const MarketplaceSearch = React.forwardRef<
  HTMLDivElement,
  MarketplaceSearchProps
>(
  (
    {
      search,
      setSearch,
      selected,
      setSelected,
      options,
      className,
      variant,
      ...props
    },
    ref,
  ) => {
    const clearSelection = useCallback(() => {
      if (!setSelected) return;
      setSelected(undefined);
    }, [setSelected]);

    const card = useMemo(() => {
      if (!selected) return undefined;
      return (
        <MarketplaceSearchCard
          image={selected.image}
          label={selected.label}
          onClick={() => clearSelection()}
        />
      );
    }, [selected, variant, clearSelection]);

    const handleClick = useCallback(
      ({ image, label }: SearchResult) => {
        if (!setSelected) return;
        setSelected({ image, label });
        setSearch("");
      },
      [setSelected, setSearch],
    );

    return (
      <div
        ref={ref}
        className={cn(marketplaceSearchVariants({ variant }), className)}
        {...props}
      >
        <MarketplaceSearchEngine
          search={search}
          setSearch={setSearch}
          cards={[card]}
          variant={variant}
        />
        <MarketplaceSearchResults variant={variant}>
          {options &&
            options.length > 0 &&
            options.map(({ image, label }, index) => (
              <MarketplaceSearchResult
                key={index}
                image={image}
                label={label}
                variant={variant}
                onClick={() => handleClick({ image, label })}
              />
            ))}
        </MarketplaceSearchResults>
      </div>
    );
  },
);

export default MarketplaceSearch;
