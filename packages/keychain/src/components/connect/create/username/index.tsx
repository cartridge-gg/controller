import {
  AchievementPlayerAvatar,
  AchievementPlayerBadge,
  Input,
  PlusIcon,
  SeedlingIcon,
  SparklesIcon,
  TimesIcon,
  cn,
} from "@cartridge/ui";
import { AccountSearchResult } from "@/hooks/account";
import * as React from "react";
import { AccountSearchDropdown } from "./account-search-dropdown";
import { Status, ValidationState } from "./status";

type CreateAccountProps = {
  usernameField: {
    value: string;
    error?: Error;
  };
  validation: ValidationState;
  error?: Error;
  isLoading: boolean;
  autoFocus?: boolean;
  showAutocomplete?: boolean;
  selectedAccount?: AccountSearchResult; // For pill functionality with account data
  onUsernameChange: (value: string) => void;
  onUsernameFocus: () => void;
  onUsernameClear: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onAccountSelect?: (result: AccountSearchResult) => void;
  onSelectedUsernameRemove?: () => void; // For removing pill
  onSelectedUsernameEdit?: () => void; // For editing pill (going back to input mode)
  onDropdownOpenChange?: (isOpen: boolean) => void; // Notify parent of dropdown state
  // Mock data props for Storybook
  mockResults?: AccountSearchResult[];
  mockIsLoading?: boolean;
  mockError?: Error;
};

export const CreateAccount = React.forwardRef<
  HTMLInputElement,
  React.HTMLAttributes<HTMLDivElement> & CreateAccountProps
>(
  (
    {
      usernameField,
      validation,
      error,
      isLoading,
      autoFocus = false,
      showAutocomplete = false,
      selectedAccount,
      onUsernameChange,
      onUsernameFocus,
      onUsernameClear,
      onKeyDown,
      onAccountSelect,
      onSelectedUsernameRemove,
      onSelectedUsernameEdit,
      onDropdownOpenChange,
      mockResults,
      mockIsLoading,
      mockError,
      className,
    },
    ref,
  ) => {
    const hasMockResults = React.useMemo(
      () => Boolean(mockResults && mockResults.length > 0),
      [mockResults],
    );

    const internalRef = React.useRef<HTMLInputElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(() => {
      if (usernameField.value === "") {
        return false;
      }

      // Initialize dropdown as open if we have autocomplete enabled, a value, and mock results
      return Boolean(
        showAutocomplete && usernameField.value.length > 0 && hasMockResults,
      );
    });
    const [selectedIndex, setSelectedIndex] = React.useState<
      number | undefined
    >(undefined);
    const [hasDropdownContent, setHasDropdownContent] =
      React.useState<boolean>(false);

    // Use imperative handle to expose the input ref
    React.useImperativeHandle(ref, () => internalRef.current!);

    // Handle auto-focus internally
    React.useEffect(() => {
      if (autoFocus && internalRef.current) {
        internalRef.current.focus();
      }
    }, [autoFocus]);

    // Focus input when returning from pill mode to edit mode
    const previousSelectedAccount = React.useRef(selectedAccount);
    React.useEffect(() => {
      // If we had a selectedAccount before and now we don't, focus the input
      if (
        previousSelectedAccount.current &&
        !selectedAccount &&
        internalRef.current
      ) {
        internalRef.current.focus();
      }
      previousSelectedAccount.current = selectedAccount;
    }, [selectedAccount]);

    const handleFocus = React.useCallback(() => {
      onUsernameFocus();
      if (showAutocomplete) {
        const shouldOpen = usernameField.value.length > 0 || hasMockResults;
        setIsDropdownOpen(shouldOpen);
        onDropdownOpenChange?.(shouldOpen);
      }
    }, [
      onUsernameFocus,
      showAutocomplete,
      usernameField.value,
      hasMockResults,
      onDropdownOpenChange,
    ]);

    const handleBlur = React.useCallback(
      (e: React.FocusEvent) => {
        // Only close if focus is not moving to the dropdown
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (
          relatedTarget &&
          relatedTarget.closest("[data-radix-popover-content]")
        ) {
          return;
        }

        // Small delay to allow for dropdown item clicks before closing
        setTimeout(() => {
          setIsDropdownOpen(false);
          setSelectedIndex(undefined);
          onDropdownOpenChange?.(false);
        }, 150);
      },
      [onDropdownOpenChange],
    );

    const handleAccountSelect = React.useCallback(
      (result: AccountSearchResult) => {
        onUsernameChange(result.username);
        setIsDropdownOpen(false);
        setSelectedIndex(undefined);
        onDropdownOpenChange?.(false);
        onAccountSelect?.(result);

        // Add a small delay to prevent immediate form submission
        // This ensures the dropdown state is updated before any form handlers fire
        setTimeout(() => {
          // This timeout ensures the selection is processed before any other events
        }, 50);
      },
      [onUsernameChange, onAccountSelect, onDropdownOpenChange],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        // Handle escape key to close dropdown
        if (showAutocomplete && isDropdownOpen && e.key === "Escape") {
          e.preventDefault();
          setIsDropdownOpen(false);
          setSelectedIndex(undefined);
          onDropdownOpenChange?.(false);
          return;
        }

        // If autocomplete is shown and dropdown is open, let dropdown handle arrow keys
        if (
          showAutocomplete &&
          isDropdownOpen &&
          (e.key === "ArrowDown" || e.key === "ArrowUp")
        ) {
          // Let dropdown handle arrow keys - don't prevent default or stop propagation
          // The dropdown's global keydown handler will take care of navigation
          return;
        }

        // If dropdown is open and Enter is pressed, let dropdown handle it
        if (showAutocomplete && isDropdownOpen && e.key === "Enter") {
          // Let dropdown handle Enter key - don't prevent default or stop propagation
          // The dropdown's global keydown handler will take care of selection
          return;
        }

        // Otherwise, pass to parent handler
        onKeyDown(e);
      },
      [onKeyDown, showAutocomplete, isDropdownOpen, onDropdownOpenChange],
    );

    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        onUsernameChange(value);

        if (showAutocomplete) {
          // Batch state updates
          React.startTransition(() => {
            const shouldOpen = Boolean(
              mockResults && mockResults.length > 0
                ? value.length > 0
                : value.length > 0,
            );
            setIsDropdownOpen(shouldOpen);
            setSelectedIndex(undefined);
            onDropdownOpenChange?.(shouldOpen);
          });
        }
      },
      [onUsernameChange, showAutocomplete, mockResults, onDropdownOpenChange],
    );

    // Render pill mode when selectedAccount is provided - simple pill design
    const renderPillInput = () => (
      <div
        className={cn(
          "flex flex-col rounded-md bg-background-150",
          (validation.status === "invalid" || error) &&
            "border border-solid border-destructive-100",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-1 bg-background-200 rounded z-10">
          <div
            className="h-12 flex items-center justify-between gap-1 flex-1 cursor-pointer p-2"
            onClick={() => {
              onSelectedUsernameEdit?.();
              if (showAutocomplete) {
                setIsDropdownOpen(false);
                setSelectedIndex(undefined);
                onDropdownOpenChange?.(false);
              }
            }}
          >
            <AchievementPlayerBadge
              icon={
                selectedAccount?.type === "create-new" ? (
                  <PlusIcon variant="line" className="text-foreground-100" />
                ) : (
                  <AchievementPlayerAvatar
                    username={selectedAccount?.username || ""}
                    className="!h-5 !w-5"
                  />
                )
              }
              rank={
                selectedAccount?.type === "create-new" ? "empty" : undefined
              }
              variant="ghost"
              size="lg"
              className="!w-8 !h-8"
              badgeClassName={cn(
                selectedAccount?.type === "create-new" && "text-foreground-400",
              )}
            />
            <div className="flex flex-row items-center justify-between gap-1 flex-1">
              <p className="text-sm font-normal px-0.5 truncate">
                {selectedAccount?.username || "N/A"}
              </p>

              <div className="flex items-center gap-3">
                {selectedAccount?.type === "create-new" ? (
                  <div className="p-1 bg-background-300 rounded inline-flex justify-center items-center gap-0.5">
                    <div className="flex justify-start items-center gap-0.5">
                      <SeedlingIcon
                        variant="solid"
                        className="text-primary"
                        size="xs"
                      />
                    </div>
                    <div className="px-0.5 flex justify-center items-center gap-2.5">
                      <p className="text-center justify-center text-primary text-xs font-normal leading-none">
                        Create New
                      </p>
                    </div>
                  </div>
                ) : selectedAccount?.points ? (
                  <div className="flex items-center justify-center gap-0.5 p-1 bg-background-300 rounded text-foreground-100">
                    <SparklesIcon
                      variant="solid"
                      size="xs"
                      className="text-foreground-100"
                    />
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-medium text-foreground-100">
                        {selectedAccount.points.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div
            className="p-2 pl-0 group cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelectedUsernameRemove?.();
              if (showAutocomplete) {
                setIsDropdownOpen(false);
                setSelectedIndex(undefined);
                onDropdownOpenChange?.(false);
              }
            }}
          >
            <TimesIcon
              size="sm"
              className="text-foreground-400 group-hover:text-foreground-300"
            />
          </div>
        </div>
        <Status
          className="rounded-b-md"
          username={selectedAccount?.username || ""}
          validation={validation}
          error={error}
        />
      </div>
    );

    const inputElement = selectedAccount ? (
      renderPillInput()
    ) : (
      <>
        <div
          className={cn(
            "flex flex-col border rounded-md border-background-300 bg-background-300",
            (validation.status === "invalid" || error) &&
              "bg-destructive-100 border-destructive-100",
            className,
          )}
        >
          <Input
            ref={internalRef}
            variant="username"
            size="lg"
            value={usernameField.value}
            spellCheck={false}
            placeholder="Username"
            className="relative z-1 focus:bg-spacer"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            isLoading={validation.status === "validating"}
            disabled={isLoading}
            onClear={() => {
              onUsernameClear();
              if (showAutocomplete) {
                setIsDropdownOpen(false);
                setSelectedIndex(undefined);
                onDropdownOpenChange?.(false);
              }
            }}
          />
          {!hasDropdownContent && (
            <Status
              username={usernameField.value}
              validation={validation}
              error={error}
            />
          )}
        </div>
        {hasDropdownContent && (
          <div className="h-8 bg-background-150 border-none" /> // Placeholder to prevent layout shift when dropdown opens
        )}
      </>
    );

    const dropdownProps = React.useMemo(
      () => ({
        query: usernameField.value,
        isOpen: isDropdownOpen,
        onOpenChange: (open: boolean) => {
          // Only allow closing via blur or explicit close, not via Popover's auto-close
          if (!open) {
            return;
          }
          setIsDropdownOpen(open);
        },
        onSelect: handleAccountSelect,
        selectedIndex,
        onSelectedIndexChange: setSelectedIndex,
        isLoading,
        validationState: {
          status: validation.status,
          exists: validation.exists,
        },
        onContentVisibilityChange: setHasDropdownContent,
        mockResults,
        mockIsLoading: mockIsLoading ?? false,
        mockError,
      }),
      [
        usernameField.value,
        isDropdownOpen,
        handleAccountSelect,
        selectedIndex,
        isLoading,
        validation.status,
        validation.exists,
        mockResults,
        mockIsLoading,
        mockError,
      ],
    );

    if (showAutocomplete) {
      return (
        <AccountSearchDropdown {...dropdownProps}>
          {inputElement}
        </AccountSearchDropdown>
      );
    }

    return inputElement;
  },
);

CreateAccount.displayName = "CreateAccount";
