import { Route, Routes, Navigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={`/account/:address/inventory?${searchParams.toString()}`}
            replace
          />
        }
      />
      <Route
        path="/account/:address"
        element={
          <Navigate
            to={`/account/:address/inventory?${searchParams.toString()}`}
            replace
          />
        }
      />
      <Route path="/account/:address/inventory" element={<Inventory />} />
      <Route path="/account/:address/trophies" element={<Trophies />} />
      <Route path="/account/:address/activity" element={<Activity />} />
      <Route path="/token/:address" element={<Token />} />
      <Route path="/collection/:address" element={<Collection />} />
      <Route path="/collection/:address/:tokenId" element={<Asset />} />
      <Route path="/collection/:address/send" element={<Send />} />
      <Route path="/trophies/:address" element={<Trophies />} />
    </Routes>
  );
}
