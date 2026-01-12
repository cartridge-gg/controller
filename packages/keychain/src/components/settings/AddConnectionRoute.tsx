import { useConnection } from "@/hooks/connection";
import { AddConnection } from "./connections/add-connection";

export function AddConnectionRoute() {
  const { controller } = useConnection();

  return <AddConnection username={controller?.username()} />;
}
