import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  Input,
  PlusIcon,
  RadioGroup,
  RadioGroupItem,
  UsStateSelect,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { CoinflowBankAccountType } from "@/hooks/payments/coinflow-withdraw";
import { SandboxWarning } from "./OverviewDrawer";

/** Payload for createCoinflowBankAccount — Coinflow tokenizes + stores the
 * account; the numbers transit our API once at create time and are never
 * persisted. `alias` is required by the mutation (it becomes the account's
 * display label). The address fields are only collected after a
 * FAILED_PRECONDITION "address required" (the KYC record has no address). */
export interface CreateBankAccountForm {
  alias: string;
  accountNumber: string;
  routingNumber: string;
  accountType: CoinflowBankAccountType;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
}

/** The retry signal from createCoinflowBankAccount (§8.10): not a hard error —
 * the form reveals the address fields and resubmits. */
export function isAddressRequiredError(error?: Error | null): boolean {
  return !!error?.message.toLowerCase().includes("address required");
}

interface CreateBankAccountDrawerProps {
  isOpen: boolean;
  /** Cancels back to the amount step; typed values survive for a resume. */
  onClose: () => void;
  isSubmitting?: boolean;
  /** createCoinflowBankAccount failure. "address required" is handled as a
   * retry path (reveals the address fields), everything else as an error. */
  error?: Error | null;
  /** Coinflow sandbox is active — renders the standing sandbox warning. */
  sandbox?: boolean;
  /** Submits the form to createCoinflowBankAccount. */
  onSubmit: (form: CreateBankAccountForm) => void;
}

/**
 * The "Add Bank Account" drawer — the in-app bank-linking form (design D4):
 * account number, ACH routing number, nickname (Coinflow's required alias) and
 * account type. The address fields stay hidden until the backend answers
 * FAILED_PRECONDITION "address required", then the form reveals them and the
 * user resubmits. On success the returned destination is selected directly.
 */
export function CreateBankAccountDrawer({
  isOpen,
  onClose,
  isSubmitting,
  error,
  sandbox,
  onSubmit,
}: CreateBankAccountDrawerProps) {
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [alias, setAlias] = useState("");
  const [accountType, setAccountType] = useState<CoinflowBankAccountType>(
    CoinflowBankAccountType.Checking,
  );
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // Latched: the mutation error resets when the resubmit starts, but once the
  // backend has asked for the address the fields must stay visible.
  const [addressRequired, setAddressRequired] = useState(false);
  useEffect(() => {
    if (isAddressRequiredError(error)) setAddressRequired(true);
  }, [error]);

  const accountValid = /^\d{4,17}$/.test(accountNumber);
  const routingValid = /^\d{9}$/.test(routingNumber);
  const addressValid =
    !addressRequired ||
    (!!address1.trim() &&
      !!city.trim() &&
      !!state.trim() &&
      /^\d{5}$/.test(zip));
  const canSubmit =
    accountValid && routingValid && !!alias.trim() && addressValid;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent
        title="Add Bank Account"
        icon={<PlusIcon variant="line" />}
      >
        {/* Always visible while sandbox is active, whatever the drawer state. */}
        {sandbox && <SandboxWarning />}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="account-number"
              className="text-xs text-foreground-400 font-medium"
            >
              Account Number
            </label>
            <Input
              id="account-number"
              placeholder="Account Number"
              inputMode="numeric"
              autoComplete="off"
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 17))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="routing-number"
              className="text-xs text-foreground-400 font-medium"
            >
              ACH/Electronic Routing Number
            </label>
            <Input
              id="routing-number"
              placeholder="ACH number"
              inputMode="numeric"
              autoComplete="off"
              value={routingNumber}
              onChange={(e) =>
                setRoutingNumber(e.target.value.replace(/\D/g, "").slice(0, 9))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="account-nickname"
              className="text-xs text-foreground-400 font-medium"
            >
              Account Nickname
            </label>
            <Input
              id="account-nickname"
              placeholder="e.g. My Checking"
              maxLength={64}
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-foreground-400 font-medium">
              Account Type
            </p>
            <RadioGroup
              value={accountType}
              onValueChange={(value) =>
                setAccountType(value as CoinflowBankAccountType)
              }
            >
              {(
                [
                  [CoinflowBankAccountType.Checking, "Checking"],
                  [CoinflowBankAccountType.Savings, "Savings"],
                ] as const
              ).map(([value, label]) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem
                    id={`account-type-${label.toLowerCase()}`}
                    value={value}
                    className="border-foreground-300 text-primary-100 data-[state=checked]:border-primary-100"
                  />
                  <label
                    htmlFor={`account-type-${label.toLowerCase()}`}
                    className="text-sm text-foreground-100 cursor-pointer"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {addressRequired && (
            <>
              <div className="p-3 text-xs border border-background-200 rounded text-foreground-300">
                <p>
                  Your home address is required to link this bank account. Enter
                  it below and continue.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="address1"
                  className="text-xs text-foreground-400 font-medium"
                >
                  Address
                </label>
                <Input
                  id="address1"
                  placeholder="Address"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex flex-[7] flex-col gap-1">
                  <label
                    htmlFor="city"
                    className="text-xs text-foreground-400 font-medium"
                  >
                    City
                  </label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="flex flex-[3] flex-col gap-1">
                  <label className="text-xs text-foreground-400 font-medium">
                    State
                  </label>
                  <UsStateSelect value={state} setValue={setState} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="zip"
                  className="text-xs text-foreground-400 font-medium"
                >
                  Zip Code
                </label>
                <Input
                  id="zip"
                  placeholder="Zip code"
                  inputMode="numeric"
                  maxLength={5}
                  value={zip}
                  onChange={(e) =>
                    setZip(e.target.value.replace(/\D/g, "").slice(0, 5))
                  }
                />
              </div>
            </>
          )}
        </div>

        {error && !addressRequired && (
          <ErrorAlert
            title="Unable to link your bank account"
            description={error.message}
          />
        )}

        <Button
          disabled={!canSubmit}
          isLoading={isSubmitting}
          onClick={() =>
            onSubmit({
              alias: alias.trim(),
              accountNumber,
              routingNumber,
              accountType,
              ...(addressRequired
                ? {
                    address1: address1.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    zip: zip.trim(),
                  }
                : {}),
            })
          }
        >
          Continue
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
