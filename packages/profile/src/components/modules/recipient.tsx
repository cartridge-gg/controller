import { useAccountInfo } from "@/hooks/account";
import {
  ArgentIcon,
  BraavosIcon,
  OpenZeppelinIcon,
  ControllerIcon,
  Input,
  Label,
  SpinnerIcon,
  TimesCircleIcon,
  WalletIcon,
  AlertIcon,
  cn,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Wallet } from "@/hooks/wallet";

function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

export const Recipient = ({
  to,
  setTo,
  setWarning,
}: {
  to: string;
  setTo: (to: string) => void;
  setWarning: (warning: string) => void;
}) => {
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [nameOrAddress, setNameOrAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hover, setHover] = useState(false);

  const { address, name, wallet, isFetching, error, warning } = useAccountInfo({
    nameOrAddress,
  });

  const getIcon = useCallback((wallet: Wallet | null) => {
    switch (wallet) {
      case Wallet.Controller:
        return <ControllerIcon className="h-8 w-8" />;
      case Wallet.ArgentX:
        return <ArgentIcon className="h-8 w-8" />;
      case Wallet.Braavos:
        return <BraavosIcon className="h-8 w-8" />;
      case Wallet.OpenZeppelin:
        return <OpenZeppelinIcon className="h-8 w-8" />;
      default:
        return <WalletIcon variant="solid" className="h-8 w-8" />;
    }
  }, []);

  const TooltipIcon = useMemo(() => {
    return getIcon(wallet);
  }, [wallet, getIcon]);

  const SelectedIcon = useMemo(() => {
    return getIcon(selectedWallet);
  }, [selectedWallet, getIcon]);

  const handleDebounce = useDebounce((value: string) => {
    setIsLoading(true);
    setNameOrAddress(value);
  }, 500);

  const handleClear = useCallback(() => {
    setValue("");
    setSelectedName("");
    setWarning("");
    setTo("");
  }, [setValue, setSelectedName, setWarning, setTo]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setValue(e.target.value);
      setSelectedName("");
      setWarning("");
      setTo("");
    },
    [setSelectedName, setValue, setWarning, setTo],
  );

  const handleBlur = useCallback(() => {
    setFocus(false);
    if (!hover) {
      handleClear();
    }
  }, [setFocus, hover, handleClear]);

  const handleClick = useCallback(() => {
    setTo(address);
    setValue(address);
    setFocus(false);
    setWarning(warning);
    setSelectedWallet(wallet);
    if (name) {
      setSelectedName(name);
      return;
    }
    setSelectedName(formatAddress(address, { size: "xs", padding: true }));
  }, [
    name,
    address,
    wallet,
    warning,
    setSelectedName,
    setTo,
    setValue,
    setFocus,
    setWarning,
  ]);

  useEffect(() => {
    handleDebounce(value);
    return () => {
      // Cleanup handled by useDebounce hook
    };
  }, [value, handleDebounce]);

  return (
    <div className="flex flex-col gap-y-px">
      <div className="flex items-center justify-between">
        <Label className="py-3 text-[11px]/3 uppercase font-bold tracking-wide">
          To
        </Label>
        {selectedName && (
          <div className="flex items-center gap-x-1.5">
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              {SelectedIcon}
            </div>
            <p className="text-xs font-medium">{selectedName}</p>
          </div>
        )}
      </div>
      <div className="relative flex flex-col gap-y-3">
        <Input
          type="text"
          spellCheck={false}
          className="bg-background-100 pr-12 border border-background-200 focus-visible:border-muted focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Destination Address"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocus(true)}
          onBlur={handleBlur}
        />
        <div
          className={cn(
            "flex items-center gap-x-1 text-destructive-foreground",
            !error && "hidden",
          )}
        >
          <AlertIcon className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <div
          className="absolute right-1.5 top-1.5 hover:opacity-80 cursor-pointer"
          onClick={handleClear}
        >
          <div className="h-9 w-9 p-1.5 flex items-center justify-center">
            {isFetching || isLoading ? (
              <SpinnerIcon className="text-muted-foreground animate-spin" />
            ) : (
              <TimesCircleIcon className="text-muted-foreground" />
            )}
          </div>
        </div>
        {(focus || hover) &&
          !error &&
          address &&
          !isLoading &&
          to !== address && (
            <div
              className="bg-spacer h-16 rounded-md flex items-center gap-x-3 px-2.5 py-3 cursor-pointer absolute top-[-8px] translate-y-full w-full z-10 shadow-md"
              onClick={handleClick}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <div className="h-10 w-10 rounded-full overflow-hidden bg-background-100 flex items-center justify-center">
                {TooltipIcon}
              </div>
              {name ? (
                <div className="flex flex-col items-start gap-x-2">
                  <p className="font-medium text-sm">{name}</p>
                  <p className="font-normal text-xs text-muted-foreground">
                    {formatAddress(address, { size: "xs", padding: true })}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-x-2">
                  <p className="font-medium text-sm">
                    {formatAddress(address, { size: "sm", padding: true })}
                  </p>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};
