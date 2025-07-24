import { useConnection } from "@/hooks/connection";
import { CreateController } from "./connect";
import { LoginMode } from "./connect/types";
import { Slot } from "expo-router";

export function App() {
  const { controller } = useConnection();

  // No controller, send to login
  if (!controller) {
    return <CreateController loginMode={LoginMode.Controller} />;
  }

  // With controller, let Expo Router handle the routing
  return <Slot />;
}
