import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Account } from "@/components/account";
import {
  Inventory,
  Collection,
  Asset,
  Send,
  Token,
} from "@/components/inventory";
import { Achievements } from "@/components/achievements";
import { Activity } from "@/components/activity";

export function App() {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={null} />
      <Route path="/account/:username" element={<Account />} />
      <Route path="/account/:username/inventory" element={<Inventory />} />
      <Route
        path="/account/:username/inventory/token/:address"
        element={<Token />}
      />
      {/* Trophy won't work without slot + namespace param for now */}
      {/* <Route path="/account/:username/trophies" element={<Trophies />} /> */}
      {/* <Route
        path="/account/:username/trophies/:address"
        element={<Trophies />}
      /> */}
      <Route path="/account/:username/activity" element={<Activity />} />
      <Route path="/account/:username/slot/:project" element={<Account />} />
      <Route
        path="/account/:username/slot/:project/inventory"
        element={<Inventory />}
      />
      <Route
        path="/account/:username/slot/:project/inventory/token/:address"
        element={<Token />}
      />
      <Route
        path="/account/:username/slot/:project/trophies"
        element={
          <Navigate
            to={location.pathname.replace("trophies", "achievements")}
            replace
          />
        }
      />
      <Route
        path="/account/:username/slot/:project/trophies/:address"
        element={
          <Navigate
            to={location.pathname.replace("trophies", "achievements")}
            replace
          />
        }
      />
      <Route
        path="/account/:username/slot/:project/achievements"
        element={<Achievements />}
      />
      <Route
        path="/account/:username/slot/:project/achievements/:address"
        element={<Achievements />}
      />
      <Route
        path="/account/:username/slot/:project/activity"
        element={<Activity />}
      />
      <Route path="/collection/:address" element={<Collection />} />
      <Route path="/collection/:address/:tokenId" element={<Asset />} />
      <Route path="/collection/:address/send" element={<Send />} />
    </Routes>
  );
}
