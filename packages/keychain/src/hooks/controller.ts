import { useConnection } from "./connection";

export function useController() {
  const { controller, setController } = useConnection();
  return { controller, setController };
}
