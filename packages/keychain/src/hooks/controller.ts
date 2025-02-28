import { useConnection } from "#hooks/connection";

export function useController() {
  const { controller, setController } = useConnection();
  return { controller, setController };
}
