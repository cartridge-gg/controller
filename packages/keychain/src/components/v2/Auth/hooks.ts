import { useCallback, useEffect, useState } from "react";
import { FormValues } from "./types";
import { useFormikContext } from "formik";
import { AccountQuery, useAccountQuery } from "generated/graphql";
import { useDebounce } from "hooks/debounce";

export function useUsername() {
  const { values } = useFormikContext<FormValues>();

  const { debouncedValue: username, debouncing } = useDebounce(
    values.username,
    1500,
  );

  return { username, debouncing };
}

type SubmitType = "signup" | "login";

export function useSubmitType(
  username: string,
  {
    isRegistering,
    onAccount,
    debouncing,
  }: {
    isRegistering?: boolean;
    onAccount?: (account: AccountQuery["account"]) => void;
    debouncing?: boolean;
  },
): SubmitType | undefined {
  const [submitType, setSubmitType] = useState<SubmitType>();
  const { values, errors, setFieldError } = useFormikContext<FormValues>();

  const { error, data } = useAccountQuery(
    { id: username },
    {
      enabled:
        !!(values.username && values.username.length >= 3) &&
        !errors.username &&
        !isRegistering,
      retry: false,
    },
  );

  useEffect(() => {
    if (debouncing) {
      return;
    }

    if (error) {
      if ((error as Error).message === "ent: account not found") {
        setSubmitType("signup");
      } else {
        setFieldError("username", "An error occured.");
      }
    } else if (data?.account) {
      setSubmitType("login");
      onAccount?.(data.account);
    }
  }, [error, data, debouncing, setFieldError, username, onAccount]);

  return submitType;
}

export function useClearField(name: string) {
  const { setFieldValue } = useFormikContext();

  return useCallback(() => {
    setFieldValue(name, "");
  }, [name, setFieldValue]);
}
