import { useCallback } from "react";
import { FormValues } from "./types";
import { useFormikContext } from "formik";
import { useDebounce } from "hooks/debounce";

export function useUsername() {
  const { values } = useFormikContext<FormValues>();

  const { debouncedValue: username, debouncing } = useDebounce(
    values.username,
    1500,
  );

  return { username, debouncing };
}

export function useClearField(name: string) {
  const { setFieldValue } = useFormikContext();

  return useCallback(() => {
    setFieldValue(name, "");
  }, [name, setFieldValue]);
}
