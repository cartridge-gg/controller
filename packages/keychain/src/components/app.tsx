import { useConnection } from "@/hooks/connection";
import { CreateController } from "./connect";
import { Slot } from "expo-router";

export function App() {
  const { controller } = useConnection();

  // No controller, send to login
  if (!controller) {
    return <CreateController />;
  }

  // With controller, let Expo Router handle the routing
  return <Slot />;
}
