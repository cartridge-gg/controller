import { LayoutFooter, Button, Checkbox, HeaderInner } from "@cartridge/ui";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface ConsentCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ConsentCheckbox({
  checked,
  onToggle,
  children,
}: ConsentCheckboxProps) {
  return (
    <div
      className="flex items-center p-3 gap-3 border border-solid-primary rounded-md cursor-pointer border-background-300 bg-background-300"
      onClick={onToggle}
    >
      <Checkbox
        variant="solid"
        checked={checked}
        onCheckedChange={onToggle}
        className={`pointer-events-none ${checked ? "text-primary-100" : "border-foreground-400"}`}
      />
      <span
        className="text-xs"
        onClick={(e) => {
          // Allow links to be clicked without toggling the checkbox
          if ((e.target as HTMLElement).tagName === "A") {
            e.stopPropagation();
          }
        }}
      >
        {children}
      </span>
    </div>
  );
}

export function Consent() {
  const [searchParams] = useSearchParams();
  const callback_uri = searchParams.get("callback_uri")!;

  const [acceptedEULA, setAcceptedEULA] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [acceptedTermsOfService, setAcceptedTermsOfService] = useState(false);

  const allAccepted =
    acceptedEULA && acceptedPrivacyPolicy && acceptedTermsOfService;

  const onSubmit = useCallback(async () => {
    if (!allAccepted) return;

    const redirect_uri = encodeURIComponent(callback_uri);
    const url = `${
      import.meta.env.VITE_CARTRIDGE_API_URL
    }/oauth2/auth?client_id=cartridge&redirect_uri=${redirect_uri}`;

    window.location.href = url;
  }, [callback_uri, allAccepted]);

  return (
    <>
      <HeaderInner
        variant="expanded"
        title="Sign in to Slot"
        description={
          <>
            <span className="font-bold">Slot</span> is requesting permission to
            manage your Cartridge Infrastructure
          </>
        }
        hideIcon
      />

      <div className="flex flex-col gap-4 p-6 pb-2">
        <div className="text-xs text-foreground-200 px-1 pb-1">
          Please review and accept the following policies in order to use Slot
        </div>
        <div className="space-y-3">
          <ConsentCheckbox
            checked={acceptedEULA}
            onToggle={() => setAcceptedEULA(!acceptedEULA)}
          >
            I accept the{" "}
            <a
              href="https://cartridge.gg/legal/slot-end-user-license-agreement"
              className="underline hover:text-primary-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              Slot End User License Agreement (EULA)
            </a>
          </ConsentCheckbox>

          <ConsentCheckbox
            checked={acceptedPrivacyPolicy}
            onToggle={() => setAcceptedPrivacyPolicy(!acceptedPrivacyPolicy)}
          >
            I accept the{" "}
            <a
              href="https://cartridge.gg/legal/privacy-policy"
              className="underline hover:text-primary-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </ConsentCheckbox>

          <ConsentCheckbox
            checked={acceptedTermsOfService}
            onToggle={() => setAcceptedTermsOfService(!acceptedTermsOfService)}
          >
            I accept the{" "}
            <a
              href="https://cartridge.gg/legal/terms-of-service"
              className="underline hover:text-primary-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>
          </ConsentCheckbox>
        </div>
      </div>

      <LayoutFooter>
        <Button onClick={onSubmit} disabled={!allAccepted}>
          Continue
        </Button>
      </LayoutFooter>
    </>
  );
}
