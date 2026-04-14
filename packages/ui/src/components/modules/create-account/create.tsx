import {
  AchievementPlayerAvatar,
  AchievementPlayerBadge,
  Input,
  PlusIcon,
  SeedlingIcon,
  SparklesIcon,
  TimesIcon,
} from "@/index";
import { cn } from "@/utils";
import { AccountSearchResult } from "@/utils/hooks/useAccountSearch";
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

    // Use imperative handle to expose the input ref
    React.useImperativeHandle(ref, () => internalRef.current!);

    // Handle auto-focus internally
    React.useEffect(() => {
      if (autoFocus && internalRef.current) {
        internalRef.current.focus();
      }
    }, [autoFocus]);

    const handleFocus = React.useCallback(() => {
      onUsernameFocus();
      if (showAutocomplete) {
        const shouldOpen = usernameField.value.length > 0 || hasMockResults;
        setIsDropdownOpen(shouldOpen);
      }
    }, [
      onUsernameFocus,
      showAutocomplete,
      usernameField.value,
      hasMockResults,
    ]);

    const handleBlur = React.useCallback((e: React.FocusEvent) => {
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
      }, 150);
    }, []);

    const handleAccountSelect = React.useCallback(
      (result: AccountSearchResult) => {
        onUsernameChange(result.username);
        setIsDropdownOpen(false);
        setSelectedIndex(undefined);
        onAccountSelect?.(result);
      },
      [onUsernameChange, onAccountSelect],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        // Handle escape key to close dropdown
        if (showAutocomplete && isDropdownOpen && e.key === "Escape") {
          e.preventDefault();
          setIsDropdownOpen(false);
          setSelectedIndex(undefined);
          return;
        }

        // If autocomplete is shown and dropdown is open, let dropdown handle arrow keys and enter
        if (
          showAutocomplete &&
          isDropdownOpen &&
          (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")
        ) {
          // Dropdown will handle these keys
          return;
        }

        // Otherwise, pass to parent handler
        onKeyDown(e);
      },
      [onKeyDown, showAutocomplete, isDropdownOpen],
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
          });
        }
      },
      [onUsernameChange, showAutocomplete, mockResults],
    );

    // Render pill mode when selectedAccount is provided - simple pill design
    const renderPillInput = () => (
      <div
        className={cn("flex flex-col rounded-md bg-background-150", className)}
      >
        <div className="h-12 flex items-center justify-between gap-1 p-2 bg-background-200 rounded shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] z-10">
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
            rank={selectedAccount?.type === "create-new" ? "empty" : undefined}
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
              <TimesIcon
                size="sm"
                className="text-foreground-400 hover:text-foreground-300 cursor-pointer"
                onClick={() => {
                  onSelectedUsernameRemove?.();
                  if (showAutocomplete) {
                    setIsDropdownOpen(false);
                    setSelectedIndex(undefined);
                  }
                }}
              />
            </div>
          </div>
        </div>
        <Status
          className="bg-background-150 rounded-b-md"
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
              }
            }}
          />
          {(!isDropdownOpen || usernameField.value === "") && (
            <Status
              username={usernameField.value}
              validation={validation}
              error={error}
            />
          )}
        </div>
        {isDropdownOpen && usernameField.value !== "" && (
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
        mockResults,
        mockIsLoading: mockIsLoading ?? false,
        mockError,
      }),
      [
        usernameField.value,
        isDropdownOpen,
        handleAccountSelect,
        selectedIndex,
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

export default CreateAccount;
