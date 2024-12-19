import { Route, Routes } from "react-router-dom";
import { Home } from "./home";
import { Authenticate } from "./authenticate";
import { Session } from "./session";
import { Failure } from "./failure";
import { Success } from "./success";
import { Pending } from "./pending";
import { Slot } from "./slot";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="authenticate" element={<Authenticate />} />
      <Route path="session" element={<Session />} />
      <Route path="slot" element={<Slot />} />
      <Route path="success" element={<Success />} />
      <Route path="failure" element={<Failure />} />
      <Route path="pending" element={<Pending />} />
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}
