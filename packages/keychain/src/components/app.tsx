import { Outlet, Route, Routes, Navigate } from "react-router-dom";

export function App() {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="/" element={<Navigate to="/slot" replace />} />
        <Route path="/slot" element={<Outlet />}>
          <Route path="auth" element={<Navigate to="/slot" replace />} />
          <Route
            path="auth/success"
            element={<Navigate to="/success" replace />}
          />
          <Route
            path="auth/failure"
            element={<Navigate to="/failure" replace />}
          />
        </Route>
        <Route path="/success" element={<div>Success</div>} />
        <Route path="/failure" element={<div>Failure</div>} />
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}