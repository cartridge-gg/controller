import { Header, Error, WalletType } from "@/components";
import { Field } from "./field";
import { Selection } from "./selection";
import { Preview } from "./preview";
import { formatAddress } from "@cartridge/utils";

type RecipientProps = {
  to: string;
  value: string;
  selectedName: string;
  selectedAddress: string;
  selectedWallet: WalletType;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
  resultName: string | undefined;
  resultAddress: string;
  resultWallet: WalletType;
  onResultClick: () => void;
  onResultEnter: () => void;
  onResultLeave: () => void;
  error: string;
  isLoading: boolean;
  isFocused: boolean;
  isHovered: boolean;
};

export const Recipient = ({
  to,
  value,
  selectedName,
  selectedAddress,
  selectedWallet,
  onChange,
  onFocus,
  onBlur,
  onClear,
  resultName,
  resultAddress,
  resultWallet,
  onResultClick,
  onResultEnter,
  onResultLeave,
  error,
  isLoading,
  isFocused,
  isHovered,
}: RecipientProps) => {
  return (
    <div className="flex flex-col gap-y-px">
      <div className="flex items-center justify-between">
        <Header label="To" />
        {(selectedName || selectedAddress) && (
          <Selection
            label={
              selectedName || formatAddress(selectedAddress, { size: "xs" })
            }
            wallet={selectedWallet}
          />
        )}
      </div>
      <div className="relative flex flex-col gap-y-3">
        <Field
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          isLoading={isLoading}
          onClear={onClear}
        />
        <Error label={error} />

        {(isFocused || isHovered) &&
          !error &&
          resultAddress &&
          !isLoading &&
          to !== resultAddress && (
            <div className="absolute bottom-[-8px] translate-y-full w-full z-10">
              <Preview
                address={resultAddress}
                wallet={resultWallet}
                onClick={onResultClick}
                onMouseEnter={onResultEnter}
                onMouseLeave={onResultLeave}
                name={resultName}
              />
            </div>
          )}
      </div>
    </div>
  );
};
