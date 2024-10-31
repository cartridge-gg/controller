import { Route, Routes } from "react-router-dom";
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

export function App() {
  return (
    <Routes>
      <Route path="/" element={null} />
      <Route path="/account/:username" element={<Account />} />
      <Route path="/account/:username/inventory" element={<Inventory />} />
      <Route path="/account/:username/trophies" element={<Trophies />} />
      <Route
        path="/account/:username/trophies/:address"
        element={<Trophies />}
      />
      <Route path="/account/:username/activity" element={<Activity />} />
      <Route path="/account/:username/slot/:namespace" element={<Account />} />
      <Route
        path="/account/:username/slot/:namespace/inventory"
        element={<Inventory />}
      />
      <Route
        path="/account/:username/slot/:namespace/trophies"
        element={<Trophies />}
      />
      <Route
        path="/account/:username/slot/:namespace/trophies/:address"
        element={<Trophies />}
      />
      <Route path="/account/:username/activity" element={<Activity />} />
      <Route path="/token/:address" element={<Token />} />
      <Route path="/collection/:address" element={<Collection />} />
      <Route path="/collection/:address/:tokenId" element={<Asset />} />
      <Route path="/collection/:address/send" element={<Send />} />
    </Routes>
  );
}
