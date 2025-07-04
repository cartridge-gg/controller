import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export function Slot() {
  const location = useLocation();
  const { project, username } = useParams<{
    project: string;
    username: string;
  }>();

  if (location.pathname === `/account/${username}/${project}`) {
    return <Navigate to="inventory" replace />;
  }

  return <Outlet />;
}
