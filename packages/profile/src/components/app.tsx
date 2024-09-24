import { useConnection } from "@/components/provider/hooks";
import { Inventory } from "@/components/inventory";
import { Quest } from "@/components/quest";
import { History } from "@/components/history";

export function App() {
  const { context } = useConnection();

  switch (context.type) {
    case "quest":
      return <Quest />;
    case "history":
      return <History />;
    default:
    case "inventory":
      return <Inventory />;
  }
}
