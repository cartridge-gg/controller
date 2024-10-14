import { Route, Routes, Navigate } from "react-router-dom";
import { Inventory } from "@/components/inventory";
import { Quest } from "@/components/quest";
import { History } from "@/components/history";
import { Collection } from "@/components/collection";

export function App() {
  return (
    <Routes>
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/quest" element={<Quest />} />
      <Route path="/history" element={<History />} />
      <Route path="/collections/:address" element={<Collection />} />
      <Route path="/" element={<Navigate to="/inventory" replace />} />
    </Routes>
  );
}
