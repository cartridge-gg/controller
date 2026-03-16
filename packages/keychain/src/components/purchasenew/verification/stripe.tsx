import { useState, useEffect } from "react";
import {
  Button,
  Input,
  CheckIcon,
  Thumbnail,
  CreditCardIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Card,
  CardContent,
  UserIcon,
} from "@cartridge/ui";
import { useNavigation } from "@/context";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useAccountVerifyMutation, useAccountPrivateQuery } from "@/utils/api";
import { useConnection } from "@/hooks/connection";

export function StripeVerification() {
  const { navigate, setShowClose } = useNavigation();
  const { isMainnet } = useConnection();
  const accountVerifyMutation = useAccountVerifyMutation();
  const { refetch: refetchAccountPrivate } = useAccountPrivateQuery(undefined, {
    enabled: false,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setShowClose(true);
  }, [setShowClose]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/purchase/checkout/stripe");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async () => {
    setError(null);

    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    let formattedPhone = "";

    if (cleanPhone.length === 10) {
      formattedPhone = `+1${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("1")) {
      formattedPhone = `+${cleanPhone}`;
    } else {
      setError("Please enter a valid 10-digit US phone number.");
      return;
    }

    try {
      const res = await accountVerifyMutation.mutateAsync({
        input: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: formattedPhone,
          sandbox: !isMainnet,
        },
      });

      if (res.accountVerify) {
        await refetchAccountPrivate();
        setIsSuccess(true);
      } else {
        setError("Verification failed.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    }
  };

  if (isSuccess) {
    return (
      <>
        <HeaderInner
          title="Verified!"
          icon={<CheckIcon />}
          variant="compressed"
        />
        <LayoutContent className="p-4 flex flex-col items-center justify-center">
          <Card className="w-full max-w-sm bg-background-200 border-background-300">
            <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
              <Thumbnail
                icon={<UserIcon variant="solid" />}
                size="lg"
                className="bg-background-300"
                rounded
              />
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Verified!</h2>
                <p className="text-sm text-foreground-300">
                  Continuing to payment...
                </p>
              </div>
            </CardContent>
          </Card>
        </LayoutContent>
        <LayoutFooter />
      </>
    );
  }

  return (
    <>
      <HeaderInner
        title="Identity Verification"
        icon={<CreditCardIcon variant="solid" />}
        variant="compressed"
      />
      <LayoutContent className="p-4 gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              First Name
            </label>
            <Input
              name="firstName"
              autoComplete="given-name"
              placeholder="First name"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFirstName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" &&
                firstName &&
                lastName &&
                phone &&
                handleSubmit()
              }
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Last Name
            </label>
            <Input
              name="lastName"
              autoComplete="family-name"
              placeholder="Last name"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setLastName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" &&
                firstName &&
                lastName &&
                phone &&
                handleSubmit()
              }
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Phone Number
            </label>
            <Input
              name="phone"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPhone(e.target.value);
                setError(null);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" &&
                firstName &&
                lastName &&
                phone &&
                handleSubmit()
              }
              type="tel"
            />
          </div>
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert title="Error" description={error} isExpanded={true} />
        )}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          isLoading={accountVerifyMutation.isLoading}
          disabled={!firstName || !lastName || !phone}
        >
          CONTINUE
        </Button>
      </LayoutFooter>
    </>
  );
}
