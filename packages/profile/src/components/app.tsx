import { Route, Routes, Navigate } from "react-router-dom";
import { Inventory, Collection, Asset, Send } from "@/components/inventory";
import { Trophies } from "@/components/trophies";
import { History } from "@/components/history";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/trophies" element={<Trophies />} />
      <Route path="/history" element={<History />} />
      <Route path="/collection/:address" element={<Collection />} />
      <Route path="/collection/:address/:tokenId" element={<Asset />} />
      <Route path="/collection/:address/send" element={<Send />} />
    </Routes>
  );
}
