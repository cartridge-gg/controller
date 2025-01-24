import { Route, Routes } from "react-router-dom";
import { Home } from "./home";
import { Authenticate } from "./authenticate";
import { Session } from "./session";
import { Failure } from "./failure";
import { Success } from "./success";
import { Pending } from "./pending";
import { Consent, Slot } from "./slot";
import { OcclusionDetector } from "./OcclusionDetector";
import { Fund } from "./slot/fund";
import { useConnection } from "@/hooks/connection";
import { useController } from "@/hooks/controller";
import { CreateController } from "./connect";
import { LoginMode } from "./connect/types";

export function App() {
  const { origin } = useConnection();
  const { controller } = useController();

  // Only render in iframe with valid origin
  if (window.self === window.top || !origin) {
    return <></>;
  }

  // If no controller is set up, show the create controller screen
  if (!controller) {
    return <CreateController loginMode={LoginMode.Controller} />;
  }

  return (
    <>
      <OcclusionDetector />
      <div style={{ position: "relative" }}>
        <Routes>
          <Route path="/" element={<Home controller={controller} />} />
          <Route path="authenticate" element={<Authenticate />} />
          <Route path="session" element={<Session />} />
          <Route path="slot" element={<Slot />}>
            <Route path="consent" element={<Consent />} />
            <Route path="fund" element={<Fund />} />
          </Route>
          <Route path="success" element={<Success />} />
          <Route path="failure" element={<Failure />} />
          <Route path="pending" element={<Pending />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </>
  );
}
