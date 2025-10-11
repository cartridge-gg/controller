import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
  Skeleton,
  cn,
} from "@cartridge/ui";
import {
  useAccountSearch,
  AccountSearchResult,
  UseAccountSearchResult,
} from "@/hooks/account";
import { AccountSearchResultItem } from "./account-search-result";
import { useDevice } from "@/hooks/device";

export interface AccountSearchDropdownProps {
  query: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: AccountSearchResult) => void;
  children: React.ReactNode;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number | undefined) => void;
  isLoading?: boolean;
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
      isLoading: externalIsLoading = false,
      mockResults,
      mockIsLoading,
      mockError,
    },
    ref,
  ) => {
    const { isMobile } = useDevice();

    const dataFromHook = useAccountSearch(
      mockResults !== undefined ? "" : query,
      {
        minLength: 1,
        debounceMs: 300,
        maxResults: isMobile ? 3 : 5,
        enabled: mockResults === undefined,
      },
    );

    const hookData =
      mockResults !== undefined
        ? ({
            results: [],
            isLoading: false,
            error: undefined,
          } satisfies UseAccountSearchResult)
        : dataFromHook;

    const results = mockResults ?? hookData.results;
    const isLoading = externalIsLoading ?? mockIsLoading ?? hookData.isLoading;
    const error = mockError ?? hookData.error;

    const hasResults = results.length > 0;
    const shouldShowDropdown = React.useMemo(() => {
      return Boolean(isOpen && query.length > 0 && (hasResults || isLoading));
    }, [isOpen, hasResults, isLoading, query.length]);

    // Auto-focus first item if input value matches the first result
    React.useEffect(() => {
      if (hasResults && results.length > 0 && results[0].username === query) {
        onSelectedIndexChange?.(0);
      }
    }, [results, query, hasResults, onSelectedIndexChange]);

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
      <Popover open={isOpen} onOpenChange={onOpenChange} modal={true}>
        <PopoverAnchor ref={ref}>{children}</PopoverAnchor>
        {shouldShowDropdown && (
          <PopoverContent
            side="bottom"
            avoidCollisions={false}
            className={cn(
              "w-[--radix-popover-trigger-width] p-0 bg-spacer border-none -translate-y-7 divide-y divide-spacer",
              "max-h-[300px] overflow-y-auto",
            )}
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {isLoading && <Skeleton className="h-12 w-full rounded-none" />}

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
