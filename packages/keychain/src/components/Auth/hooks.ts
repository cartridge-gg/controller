import { useCallback } from "react";
import { useFormikContext } from "formik";

export function useClearField(name: string) {
  const { setFieldValue } = useFormikContext();

  return useCallback(() => {
    setFieldValue(name, "");
  }, [name, setFieldValue]);
}
