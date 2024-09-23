import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "./provider/hooks";

export function Inventory() {
  const { username, address } = useConnection();

  return (
    <LayoutContainer>
      <LayoutHeader title={username} description={address} />

      <LayoutContent>
        <div>Inventory</div>
      </LayoutContent>
    </LayoutContainer>
  );
}
