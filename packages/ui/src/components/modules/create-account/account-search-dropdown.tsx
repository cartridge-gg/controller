import * as React from "react";
import { cn } from "@/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/primitives/popover";
import {
  useAccountSearch,
  AccountSearchResult,
} from "@/utils/hooks/useAccountSearch";
import { AccountSearchResultItem } from "./account-search-result";

export interface AccountSearchDropdownProps {
  query: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: AccountSearchResult) => void;
  children: React.ReactNode;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number | undefined) => void;
  // Optional mock data for Storybook
  mockResults?: AccountSearchResult[];
  mockIsLoading?: boolean;
  mockError?: Error;
}

export const AccountSearchDropdown = React.forwardRef<
  HTMLDivElement,
  AccountSearchDropdownProps
>(
  (
    {
      query,
      isOpen,
      onOpenChange,
      onSelect,
      children,
      selectedIndex,
      onSelectedIndexChange,
      mockResults,
      mockIsLoading,
      mockError,
    },
    ref,
  ) => {
    // Use mock data if provided, otherwise use real hook
    const hookData =
      mockResults !== undefined
        ? { results: [], isLoading: false, error: undefined }
        : useAccountSearch(query, {
            minLength: 1,
            debounceMs: 300,
            maxResults: 5,
          });

    const results = mockResults ?? hookData.results;
    const isLoading = mockIsLoading ?? hookData.isLoading;
    const error = mockError ?? hookData.error;

    const hasResults = results.length > 0;
    const shouldShowDropdown = React.useMemo(() => {
      return Boolean(isOpen && query.length > 0 && (hasResults || isLoading));
    }, [isOpen, hasResults, isLoading, query.length]);

    const handleSelect = React.useCallback(
      (result: AccountSearchResult) => {
        onSelect(result);
        onOpenChange(false);
        onSelectedIndexChange?.(undefined);
      },
      [onSelect, onOpenChange, onSelectedIndexChange],
    );

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (!shouldShowDropdown) return;

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            const nextIndex =
              selectedIndex === undefined
                ? 0
                : Math.min(selectedIndex + 1, results.length - 1);
            onSelectedIndexChange?.(nextIndex);
            break;
          }

          case "ArrowUp": {
            event.preventDefault();
            const prevIndex =
              selectedIndex === undefined
                ? results.length - 1
                : Math.max(selectedIndex - 1, 0);
            onSelectedIndexChange?.(prevIndex);
            break;
          }

          case "Enter": {
            event.preventDefault();
            if (selectedIndex !== undefined && results[selectedIndex]) {
              handleSelect(results[selectedIndex]);
            }
            break;
          }

          case "Escape": {
            event.preventDefault();
            onOpenChange(false);
            onSelectedIndexChange?.(undefined);
            break;
          }
        }
      },
      [
        shouldShowDropdown,
        selectedIndex,
        results,
        onSelectedIndexChange,
        onOpenChange,
        handleSelect,
      ],
    );

    // Attach keyboard event listener to the trigger element
    React.useEffect(() => {
      const handleGlobalKeyDown = (event: KeyboardEvent) => {
        handleKeyDown(event as unknown as React.KeyboardEvent);
      };

      if (shouldShowDropdown) {
        document.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
          document.removeEventListener("keydown", handleGlobalKeyDown);
        };
      }
    }, [shouldShowDropdown, handleKeyDown]);

    return (
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverAnchor ref={ref}>{children}</PopoverAnchor>
        {shouldShowDropdown && (
          <PopoverContent
            className={cn(
              "w-[--radix-popover-trigger-width] p-0 bg-spacer border-none -translate-y-7 divide-y divide-spacer",
              "max-h-[300px] overflow-y-auto",
            )}
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {isLoading && (
              <div className="px-3 py-2.5 text-sm text-foreground-400">
                Searching...
              </div>
            )}

            {error && (
              <div className="px-3 py-2.5 text-sm text-destructive-100">
                Failed to search accounts
              </div>
            )}

            {!isLoading &&
              !error &&
              results.length === 0 &&
              query.length > 0 && (
                <div className="px-3 py-2.5 text-sm text-foreground-400">
                  No accounts found
                </div>
              )}

            {!isLoading &&
              !error &&
              results.map((result, index) => (
                <AccountSearchResultItem
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === index}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => onSelectedIndexChange?.(index)}
                  onMouseLeave={() => onSelectedIndexChange?.(undefined)}
                />
              ))}
          </PopoverContent>
        )}
      </Popover>
    );
  },
);

AccountSearchDropdown.displayName = "AccountSearchDropdown";

export default AccountSearchDropdown;
