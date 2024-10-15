import { Route, Routes, Navigate } from "react-router-dom";
import { Inventory } from "@/components/inventory";
import { Quest } from "@/components/quest";
import { History } from "@/components/history";
import { Collection } from "@/components/collection";
import { Asset } from "./asset";
import { Send } from "./send";

export function App() {
  return (
    <Routes>
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/quest" element={<Quest />} />
      <Route path="/history" element={<History />} />
      <Route path="/collection/:address" element={<Collection />} />
      <Route path="/collection/:address/:tokenId" element={<Asset />} />
      <Route path="/collection/:address/send" element={<Send />} />
      <Route path="/" element={<Navigate to="/inventory" replace />} />
    </Routes>
  );
}
