import { useQueryParams } from "@/components/provider/hooks";
import { Inventory } from "@/components/inventory";
import { Quest } from "@/components/quest";
import { History } from "@/components/history";

export function App() {
  const searchParams = useQueryParams();

  switch (searchParams.get("tab")) {
    case "quest":
      return <Quest />;
    case "history":
      return <History />;
    default:
    case "inventory":
      return <Inventory />;
  }
}
