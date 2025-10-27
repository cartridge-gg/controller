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
  UseAccountSearchOptions,
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
  validationState?: UseAccountSearchOptions["validationState"];
  onContentVisibilityChange?: (hasContent: boolean) => void;
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
      validationState,
      onContentVisibilityChange,
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
        validationState,
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
    const isSearchLoading = mockIsLoading ?? hookData.isLoading;
    const isValidating = validationState?.status === "validating";
    const isLoading = externalIsLoading || isSearchLoading || isValidating;
    const error = mockError ?? hookData.error;

    const hasResults = results.length > 0;
    const shouldShowDropdown = React.useMemo(() => {
      // Keep dropdown open and keyboard active whenever:
      // - isOpen is true
      // - query has content
      return Boolean(isOpen && query.length > 0);
    }, [isOpen, query.length]);

    const hasDropdownContent = hasResults || isLoading;

    // Notify parent when dropdown content visibility changes
    React.useEffect(() => {
      onContentVisibilityChange?.(shouldShowDropdown && hasDropdownContent);
    }, [shouldShowDropdown, hasDropdownContent, onContentVisibilityChange]);

    // Auto-select first item by default when results appear or when dropdown opens
    React.useEffect(() => {
      if (isOpen && hasResults && results.length > 0) {
        onSelectedIndexChange?.(0);
      } else if (!isOpen) {
        onSelectedIndexChange?.(undefined);
      }
    }, [isOpen, hasResults, results.length, onSelectedIndexChange]);

    const handleSelect = React.useCallback(
      (result: AccountSearchResult) => {
        onSelect(result);
        onOpenChange(false);
        onSelectedIndexChange?.(undefined);
      },
      [onSelect, onOpenChange, onSelectedIndexChange],
    );

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleGlobalKeyDown = (event: KeyboardEvent) => {
        if (!isOpen || !query.length) return;

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            if (results.length === 0) return;
            const nextIndex =
              selectedIndex === undefined
                ? 0
                : Math.min(selectedIndex + 1, results.length - 1);
            onSelectedIndexChange?.(nextIndex);
            break;
          }

          case "ArrowUp": {
            event.preventDefault();
            if (results.length === 0) return;
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
      };

      document.addEventListener("keydown", handleGlobalKeyDown);
      return () => {
        document.removeEventListener("keydown", handleGlobalKeyDown);
      };
    }, [
      isOpen,
      query.length,
      selectedIndex,
      results,
      onSelectedIndexChange,
      onOpenChange,
      handleSelect,
    ]);

    return (
      <Popover open={isOpen} onOpenChange={onOpenChange} modal={true}>
        <PopoverAnchor ref={ref}>{children}</PopoverAnchor>
        {shouldShowDropdown && hasDropdownContent && (
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
                  query={query}
                  isSelected={selectedIndex === index}
                  onClick={() => handleSelect(result)}
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
