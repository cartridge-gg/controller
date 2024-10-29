import { Route, Routes } from "react-router-dom";
import { Account, LoadAccount } from "@/components/account";
import {
  Inventory,
  Collection,
  Asset,
  Send,
  Token,
} from "@/components/inventory";
import { Trophies } from "@/components/trophies";
import { Activity } from "@/components/activity";

export function App() {
  return (
    <Routes>
      <Route path="/" element={null} />
      <Route
        path="/account/:username"
        element={
          <LoadAccount>
            <Account />
          </LoadAccount>
        }
      />
      <Route
        path="/account/:username/inventory"
        element={
          <LoadAccount>
            <Inventory />
          </LoadAccount>
        }
      />
      <Route
        path="/account/:username/trophies"
        element={
          <LoadAccount>
            <Trophies />
          </LoadAccount>
        }
      />
      <Route
        path="/account/:username/trophies/:address"
        element={
          <LoadAccount>
            <Trophies />
          </LoadAccount>
        }
      />
      <Route
        path="/account/:username/activity"
        element={
          <LoadAccount>
            <Activity />
          </LoadAccount>
        }
      />
      <Route path="/token/:address" element={<Token />} />
      <Route path="/collection/:address" element={<Collection />} />
      <Route path="/collection/:address/:tokenId" element={<Asset />} />
      <Route path="/collection/:address/send" element={<Send />} />
    </Routes>
  );
}
