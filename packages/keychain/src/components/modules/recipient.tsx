import { useAccountInfo } from "@/hooks/account";
import { Recipient, WalletType } from "@cartridge/ui";
import { formatAddress } from "@cartridge/ui/utils";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "@/utils";

type Selected = {
  name: string;
  address: string;
  wallet: WalletType;
};

const initialSelected: Selected = {
  name: "",
  address: "",
  wallet: WalletType.None,
};

export const SendRecipient = ({
  to,
  submitted,
  setTo,
  setWarning,
  setError,
  setParentLoading,
  onRecipientSelected,
}: {
  to: string;
  submitted: boolean;
  setTo: (to: string) => void;
  setWarning: (warning: string) => void;
  setError: (error: Error | undefined) => void;
  setParentLoading: (loading: boolean) => void;
  onRecipientSelected?: (data: {
    name: string;
    address: string;
    walletType: WalletType;
  }) => void;
}) => {
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<Selected>(initialSelected);
  const [nameOrAddress, setNameOrAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hover, setHover] = useState(false);
  const [message, setMessage] = useState("");

  const { address, name, wallet, isFetching, error, warning } = useAccountInfo({
    nameOrAddress: nameOrAddress.toLowerCase(),
  });

  useEffect(() => {
    if (error) {
      setError(new Error(error));
      return;
    }
    if (submitted && !value) {
      const message = "Invalid recipient";
      setMessage(message);
      setError(new Error(message));
      return;
    }
    setError(undefined);
    setMessage("");
  }, [value, submitted, error, setMessage, setError]);

  useEffect(() => {
    setIsLoading(true);
    setParentLoading(true);
    const handler = debounce(() => {
      setIsLoading(false);
      setParentLoading(false);
      setNameOrAddress(value);
    }, 500);
    handler();
    return () => handler.cancel();
  }, [value, setNameOrAddress, setParentLoading, setIsLoading]);

  const handleClear = useCallback(() => {
    setValue("");
    setSelected(initialSelected);
    setWarning("");
    setMessage("");
    setError(undefined);
    setTo("");
  }, [setValue, setSelected, setWarning, setTo, setError, setMessage]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setValue(e.target.value);
      setSelected(initialSelected);
      setWarning("");
      setMessage("");
      setError(undefined);
      setTo("");
    },
    [setValue, setSelected, setWarning, setTo, setError, setMessage],
  );

  const handleClick = useCallback(() => {
    if (!address) return;
    const newSelected: Selected = {
      name: name || "",
      address: formatAddress(address, { size: "xs", padding: true }),
      wallet: wallet || WalletType.None,
    };
    setTo(address);
    setValue(address);
    setFocus(false);
    setWarning(warning);
    if (newSelected.address !== selected.address) {
      setSelected(newSelected);
    }

    // Call the callback with recipient data
    if (onRecipientSelected && name && wallet) {
      onRecipientSelected({
        name: name,
        address: address,
        walletType: wallet,
      });
    }
  }, [
    name,
    address,
    wallet,
    warning,
    selected,
    setSelected,
    setTo,
    setValue,
    setFocus,
    setWarning,
    onRecipientSelected,
  ]);

  return (
    <Recipient
      to={to}
      value={value}
      selectedName={selected.name}
      selectedAddress={selected.address}
      selectedWallet={selected.wallet}
      resultName={name}
      resultAddress={address}
      resultWallet={wallet ?? WalletType.None}
      onChange={handleChange}
      onFocus={() => setFocus(true)}
      onBlur={handleClick}
      onClear={handleClear}
      onResultClick={handleClick}
      onResultEnter={() => setHover(true)}
      onResultLeave={() => setHover(false)}
      error={
        error || message
          ? { name: "Error", message: error || message || "" }
          : undefined
      }
      isLoading={isLoading || isFetching}
      isFocused={focus}
      isHovered={hover}
    />
  );
};
