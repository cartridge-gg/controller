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
          <Navigate to={`/inventory?${searchParams.toString()}`} replace />
        }
      />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/token/:address" element={<Token />} />
      <Route path="/collection/:address" element={<Collection />} />
      <Route path="/collection/:address/:tokenId" element={<Asset />} />
      <Route path="/collection/:address/send" element={<Send />} />
      <Route path="/trophies" element={<Trophies />} />
      <Route path="/trophies/:address" element={<Trophies />} />
      <Route path="/activity" element={<Activity />} />
    </Routes>
  );
}
