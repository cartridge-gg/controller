import { Route, Routes, useParams } from "react-router-dom";
import { Account } from "@/components/account";
import {
  Inventory,
  Collection,
  Asset,
  Send,
  Token,
} from "@/components/inventory";
import { Trophies } from "@/components/trophies";
import { Activity } from "@/components/activity";
import { LayoutContainer } from "@/components/layout";
import { Slot } from "@/components/slot";

export function App() {
  return (
    <Routes>
      <Route element={<LayoutContainer />}>
        <Route path="account/:username" element={<Account />}>
          <AccountRoute />
        </Route>

        <Route path="slot/:project" element={<Slot />}>
          <AccountRoute />
        </Route>
      </Route>

      <Route path="collection/:address" element={<Collection />}>
        <Route path=":tokenId" element={<Asset />} />
        <Route path="send" element={<Send />} />
      </Route>

      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}

function AccountRoute() {
  const { project } = useParams<{
    project: string;
  }>();

  return (
    <>
      <Route path="inventory" element={<Inventory />}>
        <Route path="token/:address" element={<Token />} />
      </Route>
      {!project && (
        <Route path="trophies" element={<Trophies />}>
          <Route path=":address" element={<Trophies />} />
        </Route>
      )}
      <Route path="activity" element={<Activity />} />
    </>
  );
}
