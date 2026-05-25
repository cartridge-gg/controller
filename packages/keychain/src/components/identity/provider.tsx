import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useMeQuery } from "@cartridge/controller-ui/utils/api/cartridge";
import { useAccountPrivateQuery } from "@/utils/api";
import { VerifyIdentityDrawer } from "./VerifyIdentityDrawer";

export type IdentityContextValue = {
  userData: {
    firstName?: string | null;
    lastName?: string | null;
    dob?: string | null;
    age?: number | null;
    proveVerifiedAt?: string | null;
    phoneNumber?: string | null;
    phoneNumberVerifiedAt?: string | null;
    email?: string | null;
  };
  isLoading: boolean;
  refetchUserData: () => Promise<void>;
  initiateIdentityVerification: (cb?: () => Promise<void>) => void;
};

export const IdentityContext = createContext<IdentityContextValue>({
  userData: {},
  isLoading: false,
  refetchUserData: async () => {},
  initiateIdentityVerification: () => {},
});

export type IdentityDrawerName = "identity";

export function IdentityProvider({ children }: PropsWithChildren) {
  const {
    data: meData,
    isLoading: isMeLoading,
    refetch: refetchMe,
  } = useMeQuery();
  const {
    data: privateData,
    isLoading: isPrivateLoading,
    refetch: refetchPrivate,
  } = useAccountPrivateQuery();

  const refetchUserData = useCallback(async (): Promise<void> => {
    await Promise.all([refetchMe(), refetchPrivate()]);
  }, [refetchMe, refetchPrivate]);

  const userData = useMemo(
    () => ({
      firstName: privateData?.accountPrivate?.firstName,
      lastName: privateData?.accountPrivate?.lastName,
      dob: privateData?.accountPrivate?.dob,
      age: getAgeFromDOB(privateData?.accountPrivate?.dob),
      proveVerifiedAt: privateData?.accountPrivate?.proveVerifiedAt,
      phoneNumber: privateData?.accountPrivate?.phoneNumber,
      phoneNumberVerifiedAt: privateData?.accountPrivate?.phoneNumberVerifiedAt,
      email: meData?.me?.email,
    }),
    [privateData, meData],
  );

  const [currentDrawerName, setCurrentDrawerName] = useState<
    IdentityDrawerName | undefined
  >(undefined);

  const closeCurrentDrawer = useCallback(() => {
    setCurrentDrawerName(undefined);
  }, []);

  // prove.com identity/age verification
  const [identityVerifiedCallback, setIdentityVerifiedCallback] = useState<
    (() => Promise<void>) | undefined
  >(undefined);
  const initiateIdentityVerification = useCallback(
    (cb?: () => Promise<void>) => {
      setIdentityVerifiedCallback(() => cb);
      setCurrentDrawerName("identity");
    },
    [],
  );

  return (
    <IdentityContext.Provider
      value={{
        userData,
        isLoading: isMeLoading || isPrivateLoading,
        refetchUserData,
        initiateIdentityVerification,
      }}
    >
      {children}

      <VerifyIdentityDrawer
        isOpen={currentDrawerName === "identity"}
        onClose={() => closeCurrentDrawer()}
        onVerified={async () => {
          await refetchPrivate();
          await identityVerifiedCallback?.();
        }}
      />
    </IdentityContext.Provider>
  );
}

export const useIdentityContext = () => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error(
      "useIdentityContext must be used within an IdentityProvider",
    );
  }
  return context;
};

function getAgeFromDOB(dob: string | null | undefined): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  return years;
}
