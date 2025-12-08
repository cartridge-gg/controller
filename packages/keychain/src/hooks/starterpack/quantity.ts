import { useState, useCallback } from "react";

export interface UseQuantityOptions {
  initialQuantity?: number;
  minQuantity?: number;
}

export interface UseQuantityReturn {
  quantity: number;
  setQuantity: (quantity: number) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  resetQuantity: () => void;
}

/**
 * Hook for managing purchase quantity state
 */
export function useQuantity(
  options: UseQuantityOptions = {},
): UseQuantityReturn {
  const { initialQuantity = 1, minQuantity = 1 } = options;
  const [quantity, setQuantityState] = useState(initialQuantity);

  const setQuantity = useCallback(
    (value: number) => {
      setQuantityState(Math.max(value, minQuantity));
    },
    [minQuantity],
  );

  const incrementQuantity = useCallback(() => {
    setQuantityState((prev) => prev + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantityState((prev) => Math.max(prev - 1, minQuantity));
  }, [minQuantity]);

  const resetQuantity = useCallback(() => {
    setQuantityState(initialQuantity);
  }, [initialQuantity]);

  return {
    quantity,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    resetQuantity,
  };
}
